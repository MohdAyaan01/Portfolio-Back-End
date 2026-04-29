import { prisma } from "../db/connectDB.js"; // 1. Add this import

export const handleUpload = async (req: any, res: any) => {
  try {
    const imageUrl = req.file.path;
    
    // 2. Updated Prisma logic:
    // This saves the image URL to the user's profilePic field in PostgreSQL
    await prisma.user.update({ 
      where: { id: req.user.id }, // Make sure 'isAuth' middleware is passing req.user
      data: { profilePic: imageUrl } 
    });

    res.status(200).json({ url: imageUrl });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
};
