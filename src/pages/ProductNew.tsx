import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { ProductPageTemplate } from '../components/product/ProductPageTemplate';
import { ProductCard } from '../components/ProductCard';
import { Maximize2, RefreshCw, Save, Eye } from 'lucide-react';

// Auto-generate SKU function
const generateSKU = () => {
  const prefix = "SKU";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};

// Slugify function for auto-generating slug from name
const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

interface FormState {
  // Basic Info
  name: string;
  slug: string;
  sku: string;
  category_id: string;
  status: 'draft' | 'active' | 'archived';

  // Pricing & Inventory
  price: number;
  compare_at_price: number;
  inventory_quantity: number;
  track_inventory: boolean;
  weight: number;
  barcode: string;

  // Descriptions
  short_description: string;
  description: string;

  // Images
  thumbnail_url: string;
  gallery_urls: string[];

  // Features & Usage
  features: string[];
  how_to_use: string[];

  // Ingredients
  inci_ingredients: string[];
  key_ingredients: string[];

  // Details
  size: string;
  shelf_life: string;
  claims: string[];

  // Variants (with image support)
  variants: Array<{ label: string; image: string }>;

  // SEO
  meta_title: string;
  meta_description: string;

  // Display Settings
  is_active: boolean;
  is_featured: boolean;
  badges: string[];
}

const initialFormState: FormState = {
  name: '',
  slug: '',
  sku: generateSKU(), // Auto-generate SKU on init
  category_id: '',
  status: 'draft',
  price: 0,
  compare_at_price: 0,
  inventory_quantity: 0,
  track_inventory: true,
  weight: 0,
  barcode: '',
  short_description: '',
  description: '',
  thumbnail_url: '',
  gallery_urls: [],
  features: [''],
  how_to_use: [''],
  inci_ingredients: [''],
  key_ingredients: [''],
  size: '',
  shelf_life: '',
  claims: [],
  variants: [{ label: '', image: '' }],
  meta_title: '',
  meta_description: '',
  is_active: true,
  is_featured: false,
  badges: [],
};

export const ProductNew: React.FC = () => {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewTab, setPreviewTab] = useState<'card' | 'page-mobile' | 'page-desktop'>('card');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Auto-generate slug from name
  useEffect(() => {
    if (form.name && !form.slug) {
      setForm(prev => ({ ...prev, slug: slugify(form.name) }));
    }
  }, [form.name]);

  const update = (key: keyof FormState, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    // Clear error for this field
    if (errors[key]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const updateArr = (key: keyof FormState, index: number, value: any) => {
    setForm(prev => ({
      ...prev,
      [key]: (prev[key] as any[]).map((item, i) => i === index ? value : item)
    }));
  };

  const addRow = (key: keyof FormState, defaultValue: any = '') => {
    setForm(prev => ({
      ...prev,
      [key]: [...(prev[key] as any[]), defaultValue]
    }));
  };

  const removeRow = (key: keyof FormState, index: number) => {
    setForm(prev => ({
      ...prev,
      [key]: (prev[key] as any[]).filter((_, i) => i !== index)
    }));
  };

  const toggleClaim = (claim: string) => {
    setForm(prev => ({
      ...prev,
      claims: prev.claims.includes(claim)
        ? prev.claims.filter(c => c !== claim)
        : [...prev.claims, claim]
    }));
  };

  const toggleBadge = (badge: string) => {
    setForm(prev => ({
      ...prev,
      badges: prev.badges.includes(badge)
        ? prev.badges.filter(b => b !== badge)
        : [...prev.badges, badge]
    }));
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!form.name.trim()) nextErrors.name = "Name is required";

    // Auto-fill slug if empty
    if (!form.slug.trim()) {
      update("slug", slugify(form.name));
    }

    // Auto-fill SKU if empty
    if (!form.sku.trim()) {
      update("sku", generateSKU());
    }

    if (form.price <= 0) nextErrors.price = "Price must be greater than 0";
    if (!form.short_description.trim()) nextErrors.short_description = "Short description is required";
    if (!form.thumbnail_url.trim()) nextErrors.thumbnail_url = "At least one image is required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      setSaveMessage('Please fix the errors above');
      return;
    }

    setSaving(true);
    setSaveMessage('');

    try {
      const response = await fetch('/.netlify/functions/save-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          payload: form
        })
      });

      const result = await response.json();

      if (response.ok) {
        setSaveMessage('✓ Product saved successfully!');
        // Optionally reset form or redirect
      } else {
        setSaveMessage(`✗ Error: ${result.body || 'Failed to save product'}`);
      }
    } catch (err: any) {
      setSaveMessage(`✗ Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Build preview model for ProductPageTemplate
  const pageModel = {
    name: form.name || 'Product Name',
    slug: form.slug || 'product-slug',
    category: form.category_id || 'Category',
    shortDescription: form.short_description || 'Short description',
    overview: form.description || 'Product overview',
    price: `R${form.price || 0}`,
    compareAtPrice: form.compare_at_price ? `R${form.compare_at_price}` : undefined,
    stock: form.inventory_quantity > 0 ? 'In Stock' : 'Out of Stock',
    images: form.gallery_urls.filter(Boolean).length > 0
      ? form.gallery_urls.filter(Boolean)
      : form.thumbnail_url
        ? [form.thumbnail_url]
        : [],
    features: form.features.filter(f => f.trim()),
    howToUse: form.how_to_use.filter(h => h.trim()),
    ingredients: {
      inci: form.inci_ingredients.filter(i => i.trim()),
      key: form.key_ingredients.filter(k => k.trim()),
    },
    details: {
      size: form.size || 'N/A',
      shelfLife: form.shelf_life || 'N/A',
      claims: form.claims,
    },
    variants: form.variants.map(v => v.label).filter(Boolean),
    related: [],
    rating: 0,
    reviewCount: 0,
    reviews: [],
    seo: {
      title: form.meta_title || form.name || 'Product',
      description: form.meta_description || form.short_description || '',
    },
  };

  // Build preview model for ProductCard
  const cardModel = {
    id: 'preview',
    name: form.name || 'Product Name',
    slug: form.slug || 'product-slug',
    price: form.price || 0,
    compareAtPrice: form.compare_at_price || undefined,
    shortDescription: form.short_description || 'Short description',
    images: form.gallery_urls.filter(Boolean).length > 0
      ? form.gallery_urls.filter(Boolean)
      : form.thumbnail_url
        ? [form.thumbnail_url]
        : [],
    category: form.category_id || 'category',
    rating: 0,
    reviews: 0,
    badges: form.badges,
    inStock: form.inventory_quantity > 0,
    variants: form.variants.map(v => ({ name: v.label, inStock: true, image: v.image })).filter(v => v.name),
  };

  const renderArrayField = (
    label: string,
    key: keyof FormState,
    placeholder: string = '',
    type: 'text' | 'textarea' = 'text'
  ) => {
    const values = form[key] as string[];
    return (
      <div className="space-y-2">
        <label className="product-form-label">{label}</label>
        {values.map((value, index) => (
          <div key={index} className="flex gap-2">
            {type === 'textarea' ? (
              <textarea
                className="product-form-input flex-1"
                value={value}
                onChange={(e) => updateArr(key, index, e.target.value)}
                placeholder={placeholder}
                rows={2}
              />
            ) : (
              <input
                type="text"
                className="product-form-input flex-1"
                value={value}
                onChange={(e) => updateArr(key, index, e.target.value)}
                placeholder={placeholder}
              />
            )}
            <button
              type="button"
              onClick={() => removeRow(key, index)}
              className="product-btn-secondary px-3"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addRow(key, '')}
          className="product-btn-secondary"
        >
          + Add {label.slice(0, -1)}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <Container className="flex-1 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Create New Product</h1>

          {saveMessage && (
            <div className={`mb-4 p-4 rounded ${saveMessage.includes('✓') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {saveMessage}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* FORM */}
            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section 1: Basic Info */}
                <div className="product-form-section">
                  <h2 className="product-form-section-title">Basic Information</h2>

                  <div>
                    <label htmlFor="name" className="product-form-label">Product Name *</label>
                    <input
                      id="name"
                      type="text"
                      className="product-form-input"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="e.g., Cuticle Oil"
                    />
                    {errors.name && <p className="product-form-error">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="slug" className="product-form-label">Slug (URL) *</label>
                    <input
                      id="slug"
                      type="text"
                      className="product-form-input"
                      value={form.slug}
                      onChange={(e) => update("slug", e.target.value)}
                      placeholder="Auto-generated from name"
                    />
                    {errors.slug && <p className="product-form-error">{errors.slug}</p>}
                  </div>

                  <div>
                    <label htmlFor="sku" className="product-form-label">SKU *</label>
                    <div className="flex gap-2">
                      <input
                        id="sku"
                        type="text"
                        className="product-form-input flex-1"
                        value={form.sku}
                        onChange={(e) => update("sku", e.target.value)}
                        placeholder="Auto-generated"
                      />
                      <button
                        type="button"
                        className="product-btn-secondary"
                        onClick={() => update("sku", generateSKU())}
                        title="Generate new SKU"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                    {errors.sku && <p className="product-form-error">{errors.sku}</p>}
                  </div>

                  <div>
                    <label htmlFor="category_id" className="product-form-label">Category ID</label>
                    <input
                      id="category_id"
                      type="text"
                      className="product-form-input"
                      value={form.category_id}
                      onChange={(e) => update("category_id", e.target.value)}
                      placeholder="UUID of category"
                    />
                  </div>

                  <div>
                    <label htmlFor="status" className="product-form-label">Status</label>
                    <select
                      id="status"
                      className="product-form-input"
                      value={form.status}
                      onChange={(e) => update("status", e.target.value as any)}
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                {/* Section 2: Pricing & Stock */}
                <div className="product-form-section">
                  <h2 className="product-form-section-title">Pricing & Inventory</h2>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="price" className="product-form-label">Price (R) *</label>
                      <input
                        id="price"
                        type="number"
                        step="0.01"
                        className="product-form-input"
                        value={form.price || ''}
                        onChange={(e) => update("price", parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                      {errors.price && <p className="product-form-error">{errors.price}</p>}
                    </div>

                    <div>
                      <label htmlFor="compare_at_price" className="product-form-label">Compare At Price (R)</label>
                      <input
                        id="compare_at_price"
                        type="number"
                        step="0.01"
                        className="product-form-input"
                        value={form.compare_at_price || ''}
                        onChange={(e) => update("compare_at_price", parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="inventory_quantity" className="product-form-label">Inventory Qty</label>
                      <input
                        id="inventory_quantity"
                        type="number"
                        className="product-form-input"
                        value={form.inventory_quantity || ''}
                        onChange={(e) => update("inventory_quantity", parseInt(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label htmlFor="weight" className="product-form-label">Weight (g)</label>
                      <input
                        id="weight"
                        type="number"
                        className="product-form-input"
                        value={form.weight || ''}
                        onChange={(e) => update("weight", parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="track_inventory"
                      type="checkbox"
                      checked={form.track_inventory}
                      onChange={(e) => update("track_inventory", e.target.checked)}
                    />
                    <label htmlFor="track_inventory" className="text-sm">Track Inventory</label>
                  </div>

                  <div>
                    <label htmlFor="barcode" className="product-form-label">Barcode</label>
                    <input
                      id="barcode"
                      type="text"
                      className="product-form-input"
                      value={form.barcode}
                      onChange={(e) => update("barcode", e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                </div>

                {/* Section 3: Images */}
                <div className="product-form-section">
                  <h2 className="product-form-section-title">Images</h2>

                  <div>
                    <label htmlFor="thumbnail_url" className="product-form-label">Primary Image URL *</label>
                    <input
                      id="thumbnail_url"
                      type="url"
                      className="product-form-input"
                      value={form.thumbnail_url}
                      onChange={(e) => update("thumbnail_url", e.target.value)}
                      placeholder="https://..."
                    />
                    {errors.thumbnail_url && <p className="product-form-error">{errors.thumbnail_url}</p>}
                  </div>

                  {renderArrayField('Gallery Images', 'gallery_urls', 'Image URL')}
                </div>

                {/* Section 4: Descriptions */}
                <div className="product-form-section">
                  <h2 className="product-form-section-title">Descriptions</h2>

                  <div>
                    <label htmlFor="short_description" className="product-form-label">Short Description *</label>
                    <textarea
                      id="short_description"
                      className="product-form-input"
                      value={form.short_description}
                      onChange={(e) => update("short_description", e.target.value)}
                      placeholder="Brief product summary (max 200 chars)"
                      rows={3}
                      maxLength={200}
                    />
                    {errors.short_description && <p className="product-form-error">{errors.short_description}</p>}
                  </div>

                  <div>
                    <label htmlFor="description" className="product-form-label">Full Description</label>
                    <textarea
                      id="description"
                      className="product-form-input"
                      value={form.description}
                      onChange={(e) => update("description", e.target.value)}
                      placeholder="Detailed product description"
                      rows={6}
                    />
                  </div>
                </div>

                {/* Section 5: Features & Usage */}
                <div className="product-form-section">
                  <h2 className="product-form-section-title">Features & Usage</h2>
                  {renderArrayField('Features', 'features', 'Feature benefit', 'textarea')}
                  {renderArrayField('How to Use Steps', 'how_to_use', 'Step description', 'textarea')}
                </div>

                {/* Section 6: Ingredients */}
                <div className="product-form-section">
                  <h2 className="product-form-section-title">Ingredients</h2>
                  {renderArrayField('INCI Ingredients', 'inci_ingredients', 'e.g., Ethyl Acetate')}
                  {renderArrayField('Key Ingredients', 'key_ingredients', 'e.g., Vitamin E – Nourishes nails')}
                </div>

                {/* Section 7: Details */}
                <div className="product-form-section">
                  <h2 className="product-form-section-title">Product Details</h2>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="size" className="product-form-label">Size</label>
                      <input
                        id="size"
                        type="text"
                        className="product-form-input"
                        value={form.size}
                        onChange={(e) => update("size", e.target.value)}
                        placeholder="e.g., 15ml"
                      />
                    </div>

                    <div>
                      <label htmlFor="shelf_life" className="product-form-label">Shelf Life</label>
                      <input
                        id="shelf_life"
                        type="text"
                        className="product-form-input"
                        value={form.shelf_life}
                        onChange={(e) => update("shelf_life", e.target.value)}
                        placeholder="e.g., 24 months"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="product-form-label">Claims</label>
                    <div className="space-y-2">
                      {['Vegan', 'Cruelty-Free', 'HEMA-Free', 'Paraben-Free', 'Toxic-Free'].map(claim => (
                        <div key={claim} className="flex items-center gap-2">
                          <input
                            id={`claim-${claim}`}
                            type="checkbox"
                            checked={form.claims.includes(claim)}
                            onChange={() => toggleClaim(claim)}
                          />
                          <label htmlFor={`claim-${claim}`} className="text-sm">{claim}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Section 8: Variants */}
                <div className="product-form-section">
                  <h2 className="product-form-section-title">Variants</h2>
                  <div className="space-y-2">
                    {form.variants.map((variant, index) => (
                      <div key={index} className="space-y-2 p-4 border rounded">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Variant name (e.g., Pink - 15ml)"
                            className="product-form-input flex-1"
                            value={variant.label}
                            onChange={(e) => updateArr("variants", index, { ...variant, label: e.target.value })}
                          />
                          <button
                            type="button"
                            onClick={() => removeRow("variants", index)}
                            className="product-btn-secondary"
                          >
                            Remove
                          </button>
                        </div>
                        <input
                          type="url"
                          placeholder="Variant image URL"
                          className="product-form-input w-full"
                          value={variant.image}
                          onChange={(e) => updateArr("variants", index, { ...variant, image: e.target.value })}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addRow("variants", { label: '', image: '' })}
                      className="product-btn-secondary"
                    >
                      + Add Variant
                    </button>
                  </div>
                </div>

                {/* Section 9: SEO */}
                <div className="product-form-section">
                  <h2 className="product-form-section-title">SEO</h2>

                  <div>
                    <label htmlFor="meta_title" className="product-form-label">Meta Title</label>
                    <input
                      id="meta_title"
                      type="text"
                      className="product-form-input"
                      value={form.meta_title}
                      onChange={(e) => update("meta_title", e.target.value)}
                      placeholder="Product Name | BLOM Cosmetics"
                      maxLength={60}
                    />
                  </div>

                  <div>
                    <label htmlFor="meta_description" className="product-form-label">Meta Description</label>
                    <textarea
                      id="meta_description"
                      className="product-form-input"
                      value={form.meta_description}
                      onChange={(e) => update("meta_description", e.target.value)}
                      placeholder="SEO description for search engines"
                      rows={3}
                      maxLength={160}
                    />
                  </div>
                </div>

                {/* Section 10: Display Settings */}
                <div className="product-form-section">
                  <h2 className="product-form-section-title">Display Settings</h2>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        id="is_active"
                        type="checkbox"
                        checked={form.is_active}
                        onChange={(e) => update("is_active", e.target.checked)}
                      />
                      <label htmlFor="is_active" className="text-sm">Is Active (visible on site)</label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        id="is_featured"
                        type="checkbox"
                        checked={form.is_featured}
                        onChange={(e) => update("is_featured", e.target.checked)}
                      />
                      <label htmlFor="is_featured" className="text-sm">Is Featured (show on homepage)</label>
                    </div>
                  </div>

                  <div>
                    <label className="product-form-label">Badges</label>
                    <div className="space-y-2">
                      {['Bestseller', 'New', 'Sale', 'Limited Edition'].map(badge => (
                        <div key={badge} className="flex items-center gap-2">
                          <input
                            id={`badge-${badge}`}
                            type="checkbox"
                            checked={form.badges.includes(badge)}
                            onChange={() => toggleBadge(badge)}
                          />
                          <label htmlFor={`badge-${badge}`} className="text-sm">{badge}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="product-btn-primary flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Product'}
                  </button>
                </div>
              </form>
            </div>

            {/* PREVIEW */}
            <div className="space-y-4 sticky top-4 h-fit">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setPreviewTab('card')}
                  className={`px-4 py-2 rounded ${previewTab === 'card' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                  <Eye className="w-4 h-4 inline mr-2" />
                  Card
                </button>
                <button
                  onClick={() => setPreviewTab('page-mobile')}
                  className={`px-4 py-2 rounded ${previewTab === 'page-mobile' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                  Mobile
                </button>
                <button
                  onClick={() => setPreviewTab('page-desktop')}
                  className={`px-4 py-2 rounded ${previewTab === 'page-desktop' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                  Desktop
                </button>
              </div>

              {previewTab === 'card' && (
                <div className="max-w-sm">
                  <ProductCard product={cardModel} />
                </div>
              )}

              {previewTab === 'page-mobile' && (
                <div className="border rounded-lg overflow-hidden bg-white max-w-sm mx-auto">
                  <ProductPageTemplate product={pageModel} />
                </div>
              )}

              {previewTab === 'page-desktop' && (
                <div className="relative">
                  <button
                    onClick={() => {
                      const win = window.open('', '_blank');
                      if (win) {
                        win.document.write('<html><head><title>Product Preview</title>');
                        win.document.write('<link rel="stylesheet" href="/src/index.css">');
                        win.document.write('</head><body>');
                        win.document.write(document.querySelector('.preview-container')?.innerHTML || '');
                        win.document.write('</body></html>');
                        win.document.close();
                      }
                    }}
                    className="absolute top-2 right-2 z-10 bg-white border rounded px-3 py-2 shadow-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Maximize2 className="w-4 h-4" />
                    Fullscreen
                  </button>
                  <div className="preview-container overflow-x-auto max-w-full border rounded-lg bg-white">
                    <div className="min-w-[1200px]">
                      <ProductPageTemplate product={pageModel} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
      <Footer />

      <style>{`
        .product-form-section {
          background: white;
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .product-form-section-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e5e7eb;
        }

        .product-form-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 6px;
          color: #374151;
        }

        .product-form-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .product-form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .product-form-error {
          color: #dc2626;
          font-size: 12px;
          margin-top: 4px;
        }

        .product-btn-primary {
          background: #3b82f6;
          color: white;
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
        }

        .product-btn-primary:hover {
          background: #2563eb;
        }

        .product-btn-primary:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .product-btn-secondary {
          background: #f3f4f6;
          color: #374151;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          border: 1px solid #d1d5db;
          cursor: pointer;
          transition: all 0.2s;
        }

        .product-btn-secondary:hover {
          background: #e5e7eb;
          border-color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default ProductNew;
