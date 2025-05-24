import { useState, useEffect } from 'react';

interface Account {
  accountd: number;  // Обратите внимание на accountd вместо accountId
  isCommercial: boolean;
  address: string;
  buildingType: string;
  roomsCount: number;
  residentsCount: number;
  totalArea?: number;
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  may: number;
  jun: number;
  jul: number;
  aug: number;
  sep: number;
  oct: number;
  nov: number;
  december: number;
}

interface Normalize {
  rooms: number;
  residents: number;
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  may: number;
  jun: number;
  jul: number;
  aug: number;
  sep: number;
  oct: number;
  nov: number;
  december: number;
}

function UserList() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [normalize, setNormalize] = useState<Normalize[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [matchingNormalize, setMatchingNormalize] = useState<Normalize | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Загружаем данные пользователей
        const usersResponse = await fetch('http://localhost:5000/api/users');
        if (!usersResponse.ok) throw new Error('Не удалось загрузить данные пользователей');
        const usersData: Account[] = await usersResponse.json();
        setAccounts(usersData);

        // Загружаем нормативы
        const normalizeResponse = await fetch('http://localhost:5000/api/normalize');
        if (!normalizeResponse.ok) throw new Error('Не удалось загрузить нормативы');
        const normalizeData: Normalize[] = await normalizeResponse.json();
        setNormalize(normalizeData);

        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Произошла неизвестная ошибка';
        setError(errorMessage);
        setLoading(false);
        console.error('Ошибка загрузки данных:', err);
      }
    };

    fetchData();
  }, []);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const accountd = parseInt(e.target.value);
    const selected = accounts.find(item => item.accountd === accountd);
    setSelectedAccount(selected || null);
    
    if (selected) {
      const norm = normalize.find(
        item => item.rooms === selected.roomsCount && item.residents === selected.residentsCount
      );
      setMatchingNormalize(norm || null);
    } else {
      setMatchingNormalize(null);
    }
  };

  const getAccountConsumption = (account: Account): Record<string, number> => {
    return {
      '1': account.jan,
      '2': account.feb,
      '3': account.mar,
      '4': account.apr,
      '5': account.may,
      '6': account.jun,
      '7': account.jul,
      '8': account.aug,
      '9': account.sep,
      '10': account.oct,
      '11': account.nov,
      '12': account.december
    };
  };

  const getNormalizeMonthly = (norm: Normalize): Record<string, number> => {
    return {
      '1': norm.jan,
      '2': norm.feb,
      '3': norm.mar,
      '4': norm.apr,
      '5': norm.may,
      '6': norm.jun,
      '7': norm.jul,
      '8': norm.aug,
      '9': norm.sep,
      '10': norm.oct,
      '11': norm.nov,
      '12': norm.december
    };
  };

  const calculateTotal = (consumption: Record<string, number>): number => {
    return Object.values(consumption).reduce((sum, current) => sum + current, 0);
  };

  const calculateAverage = (consumption: Record<string, number>): number => {
    const values = Object.values(consumption);
    return values.length > 0 ? Math.round(values.reduce((sum, current) => sum + current, 0) / values.length) : 0;
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('ru-RU').format(Math.round(num));
  };

  if (loading) return <div className="loading">Загрузка данных...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;

  return (
    <div className="user-list-container">
      <h1>Анализ потребления электроэнергии</h1>
      
      <div className="account-selector">
        <select
          name="accounts"
          id="accounts-select"
          onChange={handleSelectChange}
          value={selectedAccount?.accountd || ''}
        >
          <option value="">Выберите потребителя</option>
          {accounts.map((item) => (
            <option key={item.accountd} value={item.accountd}>
              Лицевой счет: {item.accountd} ({item.roomsCount} комн., {item.residentsCount} чел.)
            </option>
          ))}
        </select>
      </div>

      {selectedAccount && (
        <div className="account-details">
          <h2>Данные потребителя</h2>
          <div className="account-info">
            <p><strong>Адрес:</strong> {selectedAccount.address}</p>
            <p><strong>Тип:</strong> {selectedAccount.isCommercial ? 'Коммерческий' : 'Бытовой'}</p>
            <p><strong>Тип строения:</strong> {selectedAccount.buildingType}</p>
            <p><strong>Количество комнат:</strong> {selectedAccount.roomsCount}</p>
            <p><strong>Количество жильцов:</strong> {selectedAccount.residentsCount}</p>
            {selectedAccount.totalArea && (
              <p><strong>Общая площадь:</strong> {selectedAccount.totalArea} м²</p>
            )}
          </div>

          <div className="consumption-info">
            <h3>Потребление электроэнергии</h3>
            <p><strong>Годовое потребление:</strong> {formatNumber(calculateTotal(getAccountConsumption(selectedAccount)))} кВт·ч</p>
            <p><strong>Среднемесячное потребление:</strong> {formatNumber(calculateAverage(getAccountConsumption(selectedAccount)))} кВт·ч</p>
          </div>

          {matchingNormalize && (
            <div className="comparison">
              <h3>Сравнение с нормативом</h3>
              <p><strong>Норматив ({matchingNormalize.rooms} комн., {matchingNormalize.residents} чел.):</strong></p>
              
              <div className="comparison-grid">
                <div>
                  <p>Годовой норматив:</p>
                  <p className="value">{formatNumber(calculateTotal(getNormalizeMonthly(matchingNormalize)))} кВт·ч</p>
                </div>
                <div>
                  <p>Разница с нормативом:</p>
                  <p className="value">
                    {formatNumber(
                      calculateTotal(getAccountConsumption(selectedAccount)) - 
                      calculateTotal(getNormalizeMonthly(matchingNormalize))
                    )} кВт·ч
                  </p>
                </div>
                <div>
                  <p>Отклонение от нормы:</p>
                  <p className="value">
                    {Math.round(
                      (calculateTotal(getAccountConsumption(selectedAccount)) / 
                      calculateTotal(getNormalizeMonthly(matchingNormalize)) * 100 - 100
                    ))}%
                  </p>
                </div>
              </div>
            </div>
          )}
          
        </div>
      )}
    </div>
  );
}

export default UserList;