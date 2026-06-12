import { prisma } from "../db/connectDB.js"; 

export const handleUpload = async (req: any, res: any) => {
  try {
    const imageUrl = req.file.path;
    
   
    await prisma.user.update({ 
      where: { id: req.user.id }, 
      data: { profilePic: imageUrl } 
    });
    res.status(200).json({ url: imageUrl });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
};
