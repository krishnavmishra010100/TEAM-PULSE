const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/org/members - Fetch all members in the current user's org
exports.getMembers = async (req, res, next) => {
  try {
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
      orderBy: { createdAt: 'asc' }
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

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'User with this email was not found. They must register first.' });
    }

    if (existingUser.organizationId === orgId) {
      return res.status(400).json({ message: 'User is already a member of this organization.' });
    }

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

// PUT /api/org/team/:userId/role - Change member role (Admin only)
exports.updateMemberRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const orgId = req.user?.organizationId || req.user?.orgId;

    if (!role || !['ADMIN', 'MEMBER'].includes(role.toUpperCase())) {
      return res.status(400).json({ message: 'Valid role (ADMIN or MEMBER) is required.' });
    }

    // Check if targeted user exists in same organization
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser || targetUser.organizationId !== orgId) {
      return res.status(404).json({ message: 'Member not found in your organization.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role.toUpperCase() },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return res.status(200).json({
      message: 'Member role updated successfully!',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating member role:', error);
    return res.status(500).json({
      message: 'Server error while updating member role.',
      error: error.message,
    });
  }
};

// DELETE /api/org/team/:userId - Remove member from org (Admin only)
exports.removeMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id || req.user?.userId || req.user?.sub;
    const orgId = req.user?.organizationId || req.user?.orgId;

    // Prevent Admin from removing themselves
    if (userId === currentUserId) {
      return res.status(400).json({ message: 'You cannot remove yourself from the organization.' });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser || targetUser.organizationId !== orgId) {
      return res.status(404).json({ message: 'Member not found in your organization.' });
    }

    // Detach user from org (set organizationId to null and reset role)
    await prisma.user.update({
      where: { id: userId },
      data: {
        organizationId: null,
        role: 'MEMBER',
      },
    });

    return res.status(200).json({ message: 'Member successfully removed from organization.' });
  } catch (error) {
    console.error('Error removing member:', error);
    return res.status(500).json({
      message: 'Server error while removing member.',
      error: error.message,
    });
  }
};