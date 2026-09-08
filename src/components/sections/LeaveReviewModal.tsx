import React, { useEffect, useRef, useState } from 'react';
import { Camera, Loader2, Sparkles, X } from 'lucide-react';

export interface SubmittedReview {
  id: string;
  name: string;
  review_text: string;
  photo_url: string | null;
  products_mentioned: string | null;
  created_at: string;
}

interface LeaveReviewModalProps {
  onClose: () => void;
  onSubmitted: (review: SubmittedReview) => void;
}

const MAX_PHOTO_DIMENSION = 900;
const NAME_LIMIT = 80;
const REVIEW_LIMIT = 600;
const PRODUCTS_LIMIT = 150;

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that photo.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not read that photo.'));
      img.onload = () => {
        const scale = Math.min(1, MAX_PHOTO_DIMENSION / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not process that photo.'));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export const LeaveReviewModal: React.FC<LeaveReviewModalProps> = ({ onClose, onSubmitted }) => {
  const [name, setName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [products, setProducts] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoError(null);

    if (!file.type.startsWith('image/')) {
      setPhotoError('Please choose an image file.');
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setPhotoError('That photo is too large. Try one under 12MB.');
      return;
    }

    try {
      const dataUrl = await compressImage(file);
      setPhotoPreview(dataUrl);
    } catch (error: any) {
      setPhotoError(error?.message || 'Could not process that photo.');
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setPhotoError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = 'Please enter your name.';
    if (!reviewText.trim()) nextErrors.reviewText = 'Please write a few words about your experience.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/.netlify/functions/site-reviews-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          review_text: reviewText.trim(),
          products_mentioned: products.trim() || null,
          photo: photoPreview,
        }),
      });

      const result = await response.json().catch(() => ({ ok: false, error: 'Unexpected response' }));
      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Could not submit your review. Please try again.');
      }

      setIsDone(true);
      onSubmitted(result.review as SubmittedReview);
      setTimeout(onClose, 1400);
    } catch (error: any) {
      setSubmitError(error?.message || 'Could not submit your review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="review-modal-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="review-modal" role="dialog" aria-modal="true" aria-labelledby="leave-review-heading">
        <button type="button" className="review-modal__close" onClick={onClose} aria-label="Close">
          <X aria-hidden="true" />
        </button>

        {isDone ? (
          <div className="review-modal__success">
            <Sparkles aria-hidden="true" />
            <h3>Thank you, {name.trim().split(' ')[0]}!</h3>
            <p>Your review is now live on our homepage.</p>
          </div>
        ) : (
          <>
            <header className="review-modal__header">
              <p className="home-eyebrow">Share your experience</p>
              <h3 id="leave-review-heading">Leave a review</h3>
              <p className="review-modal__subtitle">Tell other BLOM customers what you loved.</p>
            </header>

            <form className="review-modal__form" onSubmit={handleSubmit} noValidate>
              <div className="review-modal__field">
                <label htmlFor="review-name">Your name *</label>
                <input
                  id="review-name"
                  ref={nameInputRef}
                  type="text"
                  value={name}
                  maxLength={NAME_LIMIT}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Amanda van der Merwe"
                />
                {errors.name && <span className="review-modal__error-text">{errors.name}</span>}
              </div>

              <div className="review-modal__field">
                <label htmlFor="review-text">Your review *</label>
                <textarea
                  id="review-text"
                  value={reviewText}
                  maxLength={REVIEW_LIMIT}
                  rows={4}
                  onChange={(event) => setReviewText(event.target.value)}
                  placeholder="What did you love about BLOM Cosmetics?"
                />
                <div className="review-modal__field-footer">
                  <span>{reviewText.length}/{REVIEW_LIMIT}</span>
                  {errors.reviewText && <span className="review-modal__error-text">{errors.reviewText}</span>}
                </div>
              </div>

              <div className="review-modal__field">
                <label htmlFor="review-products">Products mentioned (optional)</label>
                <input
                  id="review-products"
                  type="text"
                  value={products}
                  maxLength={PRODUCTS_LIMIT}
                  onChange={(event) => setProducts(event.target.value)}
                  placeholder="e.g. Ultra Bond Nail Glue, Top Coat"
                />
              </div>

              <div className="review-modal__field">
                <span className="review-modal__photo-label">Add a photo (optional)</span>
                <input
                  ref={fileInputRef}
                  id="review-photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="review-modal__photo-input"
                />
                {photoPreview ? (
                  <div className="review-modal__photo-preview">
                    <img src={photoPreview} alt="Your upload preview" />
                    <button type="button" onClick={removePhoto}>Remove photo</button>
                  </div>
                ) : (
                  <label htmlFor="review-photo" className="review-modal__photo-dropzone">
                    <Camera aria-hidden="true" />
                    <span>Click to upload a photo</span>
                  </label>
                )}
                {photoError && <span className="review-modal__error-text">{photoError}</span>}
              </div>

              {submitError && <p className="review-modal__error-banner">{submitError}</p>}

              <div className="review-modal__actions">
                <button type="button" className="home-button home-button--secondary" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="home-button home-button--primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="review-modal__spinner" aria-hidden="true" /> Posting...
                    </>
                  ) : (
                    'Post my review'
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
