const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST /api/updates - Create a status update
const createUpdate = async (req, res) => {
  try {
    const { content } = req.body;

    console.log("USER FROM TOKEN:", req.user);

    // Extract user ID and Organization ID from token payload
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    const organizationId = req.user?.organizationId || req.user?.orgId;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Content is required for a status update."
      });
    }

    if (!userId) {
      return res.status(400).json({
        message: "User ID missing from token.",
        user: req.user
      });
    }

    if (!organizationId) {
      return res.status(400).json({
        message: "User does not belong to an organization."
      });
    }

    // Create status update linked via userId
    const newUpdate = await prisma.statusUpdate.create({
      data: {
        content: content.trim(),
        userId: userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    return res.status(201).json({
      message: "Status update created successfully!",
      update: newUpdate
    });

  } catch (error) {
    console.error("Error creating status update:", error);

    return res.status(500).json({
      message: "Server error while creating status update.",
      error: error.message
    });
  }
};

// GET /api/updates - Get all status updates for the user's organization
const getOrgUpdates = async (req, res) => {
  try {
    const organizationId = req.user?.organizationId || req.user?.orgId;

    if (!organizationId) {
      return res.status(400).json({
        message: "User does not belong to an organization."
      });
    }

    // Fetch all updates for users within the same organization
    const updates = await prisma.statusUpdate.findMany({
      where: {
        user: {
          organizationId: organizationId
        }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    return res.status(200).json({ updates });

  } catch (error) {
    console.error("Error fetching status updates:", error);

    return res.status(500).json({
      message: "Server error while fetching status updates.",
      error: error.message
    });
  }
};

// PUT /api/updates/:id - Edit own status update
const updateUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?.id || req.user?.userId || req.user?.sub;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Content is required." });
    }

    // Check if status update exists
    const existingUpdate = await prisma.statusUpdate.findUnique({
      where: { id }
    });

    if (!existingUpdate) {
      return res.status(404).json({ message: "Status update not found." });
    }

    // Ownership check: Only the author can edit their own status update
    if (existingUpdate.userId !== userId) {
      return res.status(403).json({ message: " You can only edit your own status updates." });
    }

    const updated = await prisma.statusUpdate.update({
      where: { id },
      data: { content: content.trim() }
    });

    return res.status(200).json({
      message: "Status update updated successfully!",
      update: updated
    });
  } catch (error) {
    console.error("Error updating status update:", error);
    return res.status(500).json({
      message: "Server error while updating status update.",
      error: error.message
    });
  }
};

// DELETE /api/updates/:id - Delete status update
const deleteUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    const userRole = req.user?.role;
    const organizationId = req.user?.organizationId || req.user?.orgId;

    const existingUpdate = await prisma.statusUpdate.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!existingUpdate) {
      return res.status(404).json({ message: "Status update not found." });
    }

    // Permission check: User owns post OR user is ADMIN in the same organization
    const isOwner = existingUpdate.userId === userId;
    const isAdminInSameOrg =
      userRole === 'ADMIN' && existingUpdate.user.organizationId === organizationId;

    if (!isOwner && !isAdminInSameOrg) {
      return res.status(403).json({ message: " Unauthorized to delete this status update." });
    }

    await prisma.statusUpdate.delete({
      where: { id }
    });

    return res.status(200).json({ message: "Status update deleted successfully." });
  } catch (error) {
    console.error("Error deleting status update:", error);
    return res.status(500).json({
      message: "Server error while deleting status update.",
      error: error.message
    });
  }
};

module.exports = {
  createUpdate,
  getOrgUpdates,
  updateUpdate,
  deleteUpdate
};