import { useEffect, useState } from 'react';
import Styles from "./filelayaut.module.css";

interface UserData {
  accountd: number;
  isCommercial: boolean;
  address: string;
  buildingType?: string;
  roomsCount?: number;
  residentsCount?: number;
  totalArea?: number;
  jan?: number;
  feb?: number;
  mar?: number;
  apr?: number;
  may?: number;
  jun?: number;
  jul?: number;
  aug?: number;
  sep?: number;
  oct?: number;
  nov?: number;
  december?: number;
}

interface DownloadProcessedFileProps {
  onClose: () => void;
}

function DownloadProcessedFile({ onClose }: DownloadProcessedFileProps) {
  const [usersData, setUsersData] = useState<UserData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUsersData(data);
      } catch (err) {
        console.error('Error fetching users data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch users data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsersData();
  }, []);

  const handleDownload = (data: any, filename: string) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const prepareUsersData = () => {
    if (!usersData) return null;
    
    return usersData.map(user => ({
      accountId: user.accountd,
      isCommercial: user.isCommercial,
      address: user.address,
      buildingType: user.buildingType,
      roomsCount: user.roomsCount,
      residentsCount: user.residentsCount,
      totalArea: user.totalArea,
      consumption: {
        '1': user.jan,
        '2': user.feb,
        '3': user.mar,
        '4': user.apr,
        '5': user.may,
        '6': user.jun,
        '7': user.jul,
        '8': user.aug,
        '9': user.sep,
        '10': user.oct,
        '11': user.nov,
        '12': user.december
      }
    }));
  };

  if (isLoading) {
    return (
      <div className={Styles.download__wrapper}>
        <div className={Styles.download__content}>
          <p>Загрузка данных из базы...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={Styles.download__wrapper}>
        <div className={Styles.download__content}>
          <div className={Styles.error__message}>
            Ошибка при загрузке данных: {error}
          </div>
          <button 
            onClick={onClose}
            className={Styles.close__button}
          >
            Закрыть
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={Styles.download__wrapper}>
      <div className={Styles.download__content}>
        <div className={Styles.download__info}>
          <h3>Экспорт данных из базы</h3>
          <p>Вы можете скачать данные пользователей в формате JSON:</p>
          
          <div className={Styles.download__actions}>
            <button 
              onClick={() => handleDownload(usersData, 'users_database_export.json')}
              className={Styles.download__button}
              disabled={!usersData}
            >
              Скачать данные пользователей (полные)
            </button>
            
            <button 
              onClick={() => handleDownload(prepareUsersData(), 'users_consumption_data.json')}
              className={Styles.download__button}
              disabled={!usersData}
            >
              Скачать данные потребления
            </button>
            
            <button 
              onClick={onClose}
              className={Styles.close__button}
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DownloadProcessedFile;