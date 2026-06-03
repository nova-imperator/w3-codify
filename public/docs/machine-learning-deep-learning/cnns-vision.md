# CNNs for computer vision

**Machine Learning & Deep Learning** · Advanced tier · downloadable study notes

---

Convolutional networks exploit the structure of images: nearby pixels are related, and a useful feature (an edge, a texture) looks the same anywhere in the frame.

• A convolution slides a small learnable filter over the image, sharing weights → far fewer parameters than a dense layer.
• Pooling downsamples, adding translation invariance.
• Classic architectures: ResNet introduced residual/skip connections that made very deep nets trainable; EfficientNet scales depth/width/resolution together.
• Transfer learning — start from an ImageNet-pretrained backbone and fine-tune on your data. This is the default; training from scratch is rarely worth it.
• Augmentation (flips, crops, colour jitter) multiplies your effective dataset.
• Beyond classification: object detection (YOLO) and segmentation localise *where* things are.

> Skip connections (ResNet) let gradients flow directly backwards, solving the degradation problem and enabling 50–150+ layer networks.

## Study image

Filters detect features; pooling adds invariance

## Checkpoint recap

1. **The main advantage of convolution over a dense layer for images is…**
   - Answer: Weight sharing → far fewer parameters and translation invariance
   - Why: A small filter shared across the image drastically cuts parameters and means a feature is detected wherever it appears.

---

© W3Codify — free during launch. Generated study notes.
