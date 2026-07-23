const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/org/members - Fetch all members in the current user's org
exports.getMembers = async (req, res, next) => {
  try {
    // Check both organizationId and orgId in case of payload variation
    const orgId = req.user?.organizationId || req.user?.orgId;

    if (!orgId) {
      return res.status(400).json({ message: 'User does not belong to an organization.' });
    }

    const members = await prisma.user.findMany({
      where: { organizationId: orgId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(200).json({ members });
  } catch (error) {
    console.error('Error fetching members:', error);
    return res.status(500).json({ 
      message: 'Server error while fetching organization members.',
      error: error.message 
    });
  }
};

// POST /api/org/invite - Add/Invite a new user or update existing user's org
exports.inviteMember = async (req, res, next) => {
  try {
    const { email, role = 'MEMBER' } = req.body;
    const orgId = req.user?.organizationId || req.user?.orgId;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    if (!orgId) {
      return res.status(400).json({ message: 'User organization not found.' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'User with this email was not found. They must register first.' });
    }

    if (existingUser.organizationId === orgId) {
      return res.status(400).json({ message: 'User is already a member of this organization.' });
    }

    // Update user's organizationId and role
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        organizationId: orgId,
        role: role.toUpperCase(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organizationId: true,
      },
    });

    return res.status(200).json({
      message: 'Member successfully added to organization!',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error inviting member:', error);
    return res.status(500).json({ 
      message: 'Server error while inviting member.',
      error: error.message 
    });
  }
};