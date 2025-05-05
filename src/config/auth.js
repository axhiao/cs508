const authConfig = {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: '48h', 
};

export default authConfig; 
