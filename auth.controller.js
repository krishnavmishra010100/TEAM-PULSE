const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ------------------------------------------------------------------
// SIGNUP: Register Organization + Admin
// ------------------------------------------------------------------
const registerOrganization = async (req, res, next) => {
  try {
    const { orgName, email, password, name } = req.body;

    // 1. Basic input validation
    if (!orgName || !email || !password) {
      return res.status(400).json({ message: "Organization name, email, and password are required." });
    }

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists." });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create Organization and initial Admin user
    const org = await prisma.organization.create({
      data: {
        name: orgName,
        users: {
          create: {
            name: name || "Admin",
            email,
            password: hashedPassword,
            role: "ADMIN",
          },
        },
      },
      include: { users: true },
    });

    const adminUser = org.users[0];

    return res.status(201).json({
      message: "Organization and admin user created successfully",
      data: {
        orgName: org.name,
        email: adminUser.email,
        inviteCode: org.inviteCode // Returns invite code in Postman!
      }
    });

  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------------------
// LOGIN: Verify User + Issue JWT
// ------------------------------------------------------------------
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // 2. Query user from DB
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 4. Generate JWT payload
    const payload = {
      userId: user.id,
      role: user.role,
      orgId: user.orgId
    };

    // 5. Sign JWT token
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_secret_key_change_in_prod',
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      message: "Login successful",
      token
    });

  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------------------
// JOIN ORG: Register new user using Invite Code
// ------------------------------------------------------------------
const joinOrg = async (req, res, next) => {
  try {
    const { inviteCode, name, email, password } = req.body;

    if (!inviteCode || !email || !password) {
      return res.status(400).json({ message: "Invite code, email, and password are required." });
    }

    const organization = await prisma.organization.findUnique({
      where: { inviteCode }
    });

    if (!organization) {
      return res.status(404).json({ message: "Invalid invite code." });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        name: name || "Member",
        email,
        password: hashedPassword,
        role: "MEMBER",
        orgId: organization.id
      }
    });

    return res.status(201).json({
      message: "Successfully joined organization!",
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        orgId: newUser.orgId
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerOrganization,
  loginUser,
  joinOrg
};