# Data Directory

This directory contains training data and uploaded files for the tennis attribution system.

## Structure

- `uploads/` - Uploaded training files (videos, images, datasets)
- `models/` - Trained model files
- `processed/` - Processed training data
- `exports/` - Exported results and reports

## File Types

### Supported Upload Formats
- **Images**: JPEG, PNG, GIF
- **Videos**: MP4, MOV, AVI
- **Data**: CSV, JSON, TXT

### Training Data Format
Training data should include:
- Tennis match footage or images
- Player attribution labels
- Timestamp information
- Court position data (if available)

## Usage

Files uploaded through the web interface are automatically saved to the `uploads/` directory with unique filenames to prevent conflicts. 