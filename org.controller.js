const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/org/members - Fetch all members in the current user's org
exports.getMembers = async (req, res) => {
  try {
    const { orgId } = req.user;

    if (!orgId) {
      return res.status(400).json({ message: 'User does not belong to an organization.' });
    }

    const members = await prisma.user.findMany({
      where: { orgId: orgId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(200).json({ members });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ message: 'Server error while fetching organization members.' });
  }
};

// POST /api/org/invite - Add/Invite a new user or update existing user's org
exports.inviteMember = async (req, res) => {
  try {
    const { email, role = 'member' } = req.body;
    const { orgId } = req.user;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'User with this email was not found. They must register first.' });
    }

    if (existingUser.orgId === orgId) {
      return res.status(400).json({ message: 'User is already a member of this organization.' });
    }

    // Update user's orgId and role
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        orgId: orgId,
        role: role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        orgId: true,
      },
    });

    res.status(200).json({
      message: 'Member successfully added to organization!',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error inviting member:', error);
    res.status(500).json({ message: 'Server error while inviting member.' });
  }
};