import { useState } from 'react';
import Styles from "./filelayaut.module.css";
import iconload from "./../../../assets/icon_load.png";

interface UploadResponse {
  success: boolean;
  message?: string;
  recordsInserted?: number;
  error?: string;
  details?: string;
}

function FileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        setSelectedFile(file);
        setMessage({ text: '', type: '' });
      } else {
        setMessage({ text: 'Пожалуйста, выберите JSON файл', type: 'error' });
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage({ text: 'Пожалуйста, выберите файл', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage({ text: 'Загрузка данных...', type: 'info' });

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result: UploadResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || result.details || 'Неизвестная ошибка сервера');
      }

      setMessage({
        text: result.message || `Успешно загружено ${result.recordsInserted} записей`,
        type: 'success'
      });
      setSelectedFile(null);

    } catch (error) {
      let errorMessage = 'Произошла ошибка при загрузке';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      console.error('Ошибка загрузки:', error);
      setMessage({
        text: errorMessage,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={Styles.upload__wrapper}>
      <input
        type="file"
        id="file-upload"
        accept=".json,application/json"
        onChange={handleFileChange}
        disabled={isLoading}
        style={{ display: 'none' }}
      />

      <div className={Styles.upload__img}>
        <img src={iconload} alt="Загрузить файл" />
      </div>

      <div className={Styles.upload__controls}>
        <label
          htmlFor="file-upload"
          className={`${Styles.upload__button} ${isLoading ? Styles.disabled : ''}`}
        >
          {isLoading ? 'Загрузка...' : 'Выбрать файл'}
        </label>

        {selectedFile && (
          <div className={Styles.file__info}>
            <p>Выбран файл: {selectedFile.name}</p>
            <p>Размер: {(selectedFile.size / 1024).toFixed(2)} KB</p>
            <button
              onClick={handleUpload}
              disabled={isLoading}
              className={Styles.upload__button}
            >
              {isLoading ? 'Идёт загрузка...' : 'Загрузить в базу'}
            </button>
          </div>
        )}

        {message.text && (
          <div className={`${Styles.message} ${Styles[message.type]}`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}

export default FileUpload;