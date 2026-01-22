
import React, { useRef, useState } from 'react';
import { Camera, Check, X, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

function ProfilePictureUpload({ user, onUpdate }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast({
        title: "Erro",
        description: "Formato inválido. Use JPG, PNG ou WebP.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Process and compress image
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 with moderate compression
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPreview(compressedDataUrl);
        setIsProcessing(false);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    if (!preview) fileInputRef.current.click();
  };

  const handleSave = () => {
    if (!preview) return;

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map(u => 
      u.id === user.id ? { ...u, profilePicture: preview } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    onUpdate({ ...user, profilePicture: preview });
    setPreview(null);
    toast({
      title: "Foto atualizada!",
      description: "Nova foto de perfil salva com sucesso.",
    });
  };

  const handleCancel = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative group">
        <div 
          className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-slate-700 bg-slate-800 flex items-center justify-center cursor-pointer relative"
          onClick={triggerFileInput}
        >
          {isProcessing ? (
             <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
          ) : (preview || user.profilePicture) ? (
            <img 
              src={preview || user.profilePicture} 
              alt={user.name} 
              className={`w-full h-full object-cover ${preview ? 'opacity-80' : ''}`}
            />
          ) : (
            <span className="text-xl md:text-2xl font-bold text-slate-400">
              {getInitials(user.name)}
            </span>
          )}
          
          {/* Hover Overlay */}
          {!preview && !isProcessing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </div>
          )}
        </div>

        {!preview && (
          <div className="absolute bottom-0 right-0 bg-cyan-500 rounded-full p-1.5 border-2 border-slate-950 cursor-pointer pointer-events-none group-hover:bg-cyan-600 transition-colors">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg, image/png, image/webp"
          className="hidden"
        />
      </div>

      {preview && (
        <div className="flex gap-2 animate-in fade-in slide-in-from-left-4">
          <button 
            onClick={handleSave}
            className="p-2 bg-green-600 hover:bg-green-700 rounded-full text-white transition-colors"
            title="Salvar"
          >
            <Check className="w-4 h-4" />
          </button>
          <button 
            onClick={handleCancel}
            className="p-2 bg-red-600 hover:bg-red-700 rounded-full text-white transition-colors"
            title="Cancelar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfilePictureUpload;
