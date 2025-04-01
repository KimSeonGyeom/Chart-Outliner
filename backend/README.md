# Chart Outliner Backend

This is the Flask backend for Chart Outliner, providing image processing capabilities with OpenCV.

## Setup

1. Create a virtual environment:
```
python -m venv venv
```

2. Activate the virtual environment:
   - Windows: 
   ```
   venv\Scripts\activate
   ```
   - macOS/Linux: 
   ```
   source venv/bin/activate
   ```

3. Install dependencies:
```
pip install -r requirements.txt
```

## Running the Server

Start the Flask server:
```
python app.py
```

The server will run at `http://localhost:5000` by default.

## API Endpoints

- `GET /api/health`: Health check endpoint
- `POST /api/process-image`: Process an uploaded image
  - Request: Form data with 'image' file
  - Response: JSON with processed image data
- `POST /api/process-chart`: Process chart image with Canny edge detection and denoising
  - Request: JSON with base64 `imageData` field
  - Response: JSON with processed images including Canny edges and denoised results

## Development

- Environment variables can be configured in the `.env` file
- Add new image processing functions in the `utils/image_processor.py` file 