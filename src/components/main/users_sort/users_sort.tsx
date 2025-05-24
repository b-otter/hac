import { useState, useEffect } from 'react';
import './users_sort.css';

interface Account {
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

      // Сортировка
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
  // Пагинация
  useEffect(() => {
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    setDisplayedUsers(filteredUsers.slice(indexOfFirstUser, indexOfLastUser));
  }, [filteredUsers, currentPage, usersPerPage]);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('ru-RU').format(Math.round(num));
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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