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

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Database operation (Org + User creation) will be hooked up here
    
    return res.status(201).json({
      message: "Organization and admin user created successfully",
      data: { orgName, email }
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

    // 2. Mock user check (Replace with real DB query e.g., await User.findOne({ email }))
    // For now, simulating a database user lookup:
    const mockUser = {
      id: "usr_12345",
      email: email,
      // Assume this hash corresponds to the password 'password123'
      passwordHash: "$2a$10$w8/02X.v62KzQ4h/sAJu8.a0.1H4Qv6g6WdE/4U4GvQJzJzZ.", 
      role: "admin",
      organizationId: "org_67890"
    };

    // 3. Compare submitted password with stored hash
    // const isMatch = await bcrypt.compare(password, mockUser.passwordHash);
    // if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // 4. Generate JWT payload (Never include sensitive data like passwords!)
    const payload = {
      userId: mockUser.id,
      role: mockUser.role,
      orgId: mockUser.organizationId
    };

    // 5. Sign JWT token
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_secret_key_change_in_prod',
      { expiresIn: '1d' } // Token expires in 1 day
    );

    // 6. Return response with token
    return res.status(200).json({
      message: "Login successful",
      token
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerOrganization,
  loginUser
};