import { useState, useEffect } from 'react';
import './users_sort.css';

interface OriginalAccount {
  accountd: number;
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

interface ListingServiceResult {
  hasListings: boolean;
  count?: number;
  url?: string;
  error?: string;
}

interface ListingInfo {
  avito: ListingServiceResult;
  cian: ListingServiceResult;
  lastChecked?: string;
}

interface Account extends OriginalAccount {
  listingInfo?: ListingInfo;
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

function UsersSort() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [normalize, setNormalize] = useState<Normalize[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<{ account: Account, deviation: number, total: number, normTotal: number }[]>([]);
  const [displayedUsers, setDisplayedUsers] = useState<{ account: Account, deviation: number, total: number, normTotal: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [showCommercial, setShowCommercial] = useState<'all' | 'commercial' | 'non-commercial'>('non-commercial');
  const [minDeviation, setMinDeviation] = useState(40);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'deviation', direction: 'desc' });
  const [checkingAddresses, setCheckingAddresses] = useState<Record<number, boolean>>({});
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const usersResponse = await fetch('http://localhost:5000/api/users');
        if (!usersResponse.ok) throw new Error('Не удалось загрузить данные пользователей');
        const usersData: Account[] = await usersResponse.json();
        setAccounts(usersData);

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

  const checkAddress = async (accountId: number, address: string) => {
    setCheckingAddresses(prev => ({ ...prev, [accountId]: true }));
    
    try {
      const response = await fetch(`http://localhost:5000/api/check-listings?address=${encodeURIComponent(address)}`);
      if (!response.ok) throw new Error('Ошибка при проверке объявлений');
      
      const listingInfo = await response.json();

      setAccounts(prevAccounts => 
        prevAccounts.map(account => 
          account.accountd === accountId 
            ? { ...account, listingInfo } 
            : account
        )
      );
    } catch (error) {
      console.error(`Ошибка при проверке адреса ${address}:`, error);
      
      setAccounts(prevAccounts => 
        prevAccounts.map(account => 
          account.accountd === accountId 
            ? { 
                ...account, 
                listingInfo: {
                  avito: { hasListings: false, error: 'Ошибка проверки' },
                  cian: { hasListings: false, error: 'Ошибка проверки' }
                } 
              } 
            : account
        )
      );
    } finally {
      setCheckingAddresses(prev => ({ ...prev, [accountId]: false }));
    }
  };

  const calculateDeviation = (account: Account, norm: Normalize | undefined): number => {
    if (!norm) return 0;

    const accountTotal = account.jan + account.feb + account.mar + account.apr +
      account.may + account.jun + account.jul + account.aug +
      account.sep + account.oct + account.nov + account.december;

    const normTotal = norm.jan + norm.feb + norm.mar + norm.apr +
      norm.may + norm.jun + norm.jul + norm.aug +
      norm.sep + norm.oct + norm.nov + norm.december;

    return normTotal > 0 ? Math.round((accountTotal / normTotal) * 100 - 100) : 0;
  };

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    if (accounts.length > 0 && normalize.length > 0) {
      const filtered = accounts
        .map(account => {
          const norm = normalize.find(
            n => n.rooms === account.roomsCount && n.residents === account.residentsCount
          );
          const total = account.jan + account.feb + account.mar + account.apr +
            account.may + account.jun + account.jul + account.aug +
            account.sep + account.oct + account.nov + account.december;
          const normTotal = norm ? norm.jan + norm.feb + norm.mar + norm.apr +
            norm.may + norm.jun + norm.jul + norm.aug +
            norm.sep + norm.oct + norm.nov + norm.december : 0;
          const deviation = calculateDeviation(account, norm);
          return { account, deviation, total, normTotal };
        })
        .filter(item => {
          const deviationFilter = Math.abs(item.deviation) >= minDeviation;
          let commercialFilter = true;
          if (showCommercial === 'commercial') {
            commercialFilter = item.account.isCommercial;
          } else if (showCommercial === 'non-commercial') {
            commercialFilter = !item.account.isCommercial;
          }
          return deviationFilter && commercialFilter;
        });

      filtered.sort((a, b) => {
        if (a[sortConfig.key as keyof typeof a] < b[sortConfig.key as keyof typeof b]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key as keyof typeof a] > b[sortConfig.key as keyof typeof b]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });

      setFilteredUsers(filtered);
      setCurrentPage(1);
    }
  }, [accounts, normalize, showCommercial, minDeviation, sortConfig]);

  useEffect(() => {
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    setDisplayedUsers(filteredUsers.slice(indexOfFirstUser, indexOfLastUser));
  }, [filteredUsers, currentPage, usersPerPage]);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('ru-RU').format(Math.round(num));
  };

  const handleShowOnMap = (address: string) => {
    setSelectedAddress(address);
  };

  const renderListingInfo = (account: Account) => {
    const isChecking = checkingAddresses[account.accountd] || false;
    
    if (isChecking) {
      return <td colSpan={2} className="status-pending">Поиск...</td>;
    }
    
    if (!account.listingInfo) {
      return (
        <td colSpan={2}>
          <button 
            onClick={() => checkAddress(account.accountd, account.address)}
            className="check-button"
          >
            Найти объявления
          </button>
        </td>
      );
    }

    return (
      <>
        <td className={account.listingInfo.avito.hasListings ? 'has-listings' : 'no-listings'}>
          {account.listingInfo.avito.error ? (
            <span className="error" title={account.listingInfo.avito.error}>Ошибка</span>
          ) : account.listingInfo.avito.hasListings ? (
            <a href={account.listingInfo.avito.url} target="_blank" rel="noopener noreferrer">
              {account.listingInfo.avito.count} объяв.
            </a>
          ) : 'Нет'}
        </td>
        <td className={account.listingInfo.cian.hasListings ? 'has-listings' : 'no-listings'}>
          {account.listingInfo.cian.error ? (
            <span className="error" title={account.listingInfo.cian.error}>Ошибка</span>
          ) : account.listingInfo.cian.hasListings ? (
            <a href={account.listingInfo.cian.url} target="_blank" rel="noopener noreferrer">
              {account.listingInfo.cian.count} объяв.
            </a>
          ) : 'Нет'}
        </td>
      </>
    );
  };

  if (loading) return <div className="loading">Загрузка данных...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;

  return (
    <div className="users-sort-container">
      <h1>Фильтр потребителей</h1>

      <div className="filters">
        <div className="filter-group">
          <span>Тип потребителя:</span>
          <button
            className={showCommercial === 'all' ? 'active' : ''}
            onClick={() => setShowCommercial('all')}
          >
            Все
          </button>
          <button
            className={showCommercial === 'commercial' ? 'active' : ''}
            onClick={() => setShowCommercial('commercial')}
          >
            Коммерческие
          </button>
          <button
            className={showCommercial === 'non-commercial' ? 'active' : ''}
            onClick={() => setShowCommercial('non-commercial')}
          >
            Некоммерческие
          </button>
        </div>

        <div className="filter-group">
          <span>Минимальное отклонение (%):</span>
          <input
            type="number"
            value={minDeviation}
            onChange={(e) => setMinDeviation(Number(e.target.value))}
            min="0"
          />
        </div>
      </div>

      <div className="results-info">
        <p>Найдено потребителей: <span>{filteredUsers.length}</span></p>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="no-results">Нет пользователей, соответствующих критериям</div>
      ) : (
        <>
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th onClick={() => requestSort('account.accountd')}>
                    Лицевой счет {sortConfig.key === 'account.accountd' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th>Тип</th>
                  <th>Адрес</th>
                  <th>Комнат</th>
                  <th>Жильцов</th>
                  <th className='total'
                    onClick={() => requestSort('total')}>
                    Потребление {sortConfig.key === 'total' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th>Норматив</th>
                  <th className='deviation'
                    onClick={() => requestSort('deviation')}>
                    Отклонение {sortConfig.key === 'deviation' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th>Avito</th>
                  <th>ЦИАН</th>
                  <th>Карта</th>
                </tr>
              </thead>
              <tbody>
                {displayedUsers.map(({ account, deviation, total, normTotal }) => (
                  <tr key={account.accountd}>
                    <td>{account.accountd}</td>
                    <td>{account.isCommercial ? 'Коммерческий' : 'Некоммерческий'}</td>
                    <td>{account.address}</td>
                    <td>{account.roomsCount}</td>
                    <td>{account.residentsCount}</td>
                    <td>{formatNumber(total)} кВт·ч</td>
                    <td>{normTotal ? formatNumber(normTotal) + ' кВт·ч' : '-'}</td>
                    <td className={`deviation ${deviation > 0 ? 'positive' : 'negative'}`}>
                      {deviation}%
                    </td>
                    {renderListingInfo(account)}
                    <td>
                      <button 
                        onClick={() => handleShowOnMap(account.address)}
                        className="map-button"
                      >
                        На карте
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedAddress && (
            <div className="map-container">
              <h3>Карта: {selectedAddress}</h3>
              <div className="map-iframe-container">
                <iframe
                  width="100%"
                  height="400"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedAddress)}&output=embed`}
                  title="Карта с выбранным адресом"
                ></iframe>
              </div>
            </div>
          )}

          <div className="pagination">
            {Array.from({ length: Math.ceil(filteredUsers.length / usersPerPage) }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={currentPage === i + 1 ? 'active' : ''}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default UsersSort;