const fs = require('fs');
const path = require('path');

/**
 * Safely deletes a file from the disk
 * @param {string} relativePath - The path stored in the database (e.g., /uploads/image.jpg)
 */
const deleteFile = (relativePath) => {
  if (!relativePath) return;

  try {
    // Convert relative path to absolute
    // Assuming relativePath starts with /uploads/
    const filename = relativePath.split('/').pop();
    const absolutePath = path.join(__dirname, '../uploads', filename);

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      console.log(`🗑️ Deleted file: ${absolutePath}`);
    }
  } catch (err) {
    console.error(`❌ Failed to delete file: ${relativePath}`, err.message);
  }
};

module.exports = { deleteFile };
