import { useEffect, useRef, useState } from "react";
import { ImagePlus, Trash2, UploadCloud } from "lucide-react";

const MAX_IMAGES = 8;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const ImageUploader = ({
  images,
  setImages,
  error,
  setFieldError,
}) => {
  const inputRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    const urls = images.map((image) => URL.createObjectURL(image));

    setPreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  const validateFiles = (files) => {
    const validFiles = [];
    let validationMessage = "";

    files.forEach((file) => {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        validationMessage =
          "Only JPG, JPEG, PNG, and WEBP images are allowed.";
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        validationMessage = `${file.name} exceeds the 5 MB size limit.`;
        return;
      }

      validFiles.push(file);
    });

    if (images.length + validFiles.length > MAX_IMAGES) {
      validationMessage = `Maximum ${MAX_IMAGES} product images are allowed.`;
      return [];
    }

    setFieldError?.("images", validationMessage);

    return validFiles;
  };

  const addFiles = (fileList) => {
    const files = Array.from(fileList || []);

    if (!files.length) return;

    const validFiles = validateFiles(files);

    if (!validFiles.length) return;

    setImages((currentImages) => [...currentImages, ...validFiles]);

    setFieldError?.("images", "");
  };

  const handleInputChange = (event) => {
    addFiles(event.target.files);

    event.target.value = "";
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(true);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.currentTarget.contains(event.relatedTarget)) {
      return;
    }

    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);

    addFiles(event.dataTransfer.files);
  };

  const removeImage = (index) => {
    setImages((currentImages) =>
      currentImages.filter((_, imageIndex) => imageIndex !== index)
    );

    setFieldError?.("images", "");
  };

  return (
    <div className="add-product-section">
      <div className="add-product-section__header">
        <div>
          <h2>Product Images</h2>

          <p>
            Upload clear product images. The first image will be used as the
            primary product image.
          </p>
        </div>

        <span className="image-uploader__count">
          {images.length}/{MAX_IMAGES}
        </span>
      </div>

      <div
        className={`image-uploader ${
          isDragging ? "image-uploader--dragging" : ""
        } ${error ? "image-uploader--error" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            inputRef.current?.click();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          multiple
          hidden
          onChange={handleInputChange}
        />

        <div className="image-uploader__icon">
          <UploadCloud size={28} />
        </div>

        <h3>Drop product images here</h3>

        <p>
          Drag and drop images or <span>browse files</span>
        </p>

        <small>JPG, JPEG, PNG or WEBP · Maximum 5 MB per image</small>
      </div>

      {error && <p className="field-error">{error}</p>}

      {previews.length > 0 && (
        <div className="image-preview-grid">
          {previews.map((preview, index) => (
            <div className="image-preview-card" key={`${preview}-${index}`}>
              <img
                src={preview}
                alt={`Product preview ${index + 1}`}
              />

              {index === 0 && (
                <span className="image-preview-card__primary">
                  Primary
                </span>
              )}

              <button
                type="button"
                className="image-preview-card__remove"
                onClick={() => removeImage(index)}
                aria-label={`Remove image ${index + 1}`}
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}

          {images.length < MAX_IMAGES && (
            <button
              type="button"
              className="image-preview-add"
              onClick={() => inputRef.current?.click()}
            >
              <ImagePlus size={23} />

              <span>Add Image</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;