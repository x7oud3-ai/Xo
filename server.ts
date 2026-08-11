import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser for JSON with high limit for image upload
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // ImgBB Image Upload API Proxy
  app.post('/api/upload-image', async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: 'لم يتم توفير صورة للرفع' });
      }

      const apiKey = process.env.IMGBB_API_KEY || 'd015dd34e005b5dd56d68d2fe147c267';

      // Clean base64 string if data URL prefix exists
      const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, '');

      const params = new URLSearchParams();
      params.append('image', cleanBase64);

      const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const data = await imgbbRes.json();

      if (data.success && data.data?.url) {
        return res.json({
          success: true,
          url: data.data.url,
          display_url: data.data.display_url || data.data.url,
          delete_url: data.data.delete_url,
        });
      } else {
        console.error('ImgBB API Error:', data);
        return res.status(500).json({
          error: data.error?.message || 'فشل رفع الصورة إلى خادم ImgBB',
        });
      }
    } catch (err: any) {
      console.error('Server Upload Proxy Error:', err);
      return res.status(500).json({ error: err.message || 'خطأ في خادم الرفع' });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
