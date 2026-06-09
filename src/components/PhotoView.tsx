interface PhotoViewProps {
  imageUrl: string | null;
}

export function PhotoView({ imageUrl }: PhotoViewProps) {
  if (!imageUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-gray-400 p-4 text-center">
        <p>请上传墙壁照片以进行预览</p>
      </div>
    );
  }

  return (
    <img 
      src={imageUrl} 
      alt="Wall background" 
      className="w-full h-full object-cover"
    />
  );
}
