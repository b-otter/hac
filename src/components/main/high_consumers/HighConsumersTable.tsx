import React, { useEffect, useState } from 'react';
import './HighConsumersTable.css'
type User = {
    accountId: number;
    isCommercial: boolean;
    address: string;
    buildingType: string;
    roomsCount: number;
    residentsCount: number;
    totalArea: number;
    oct: number;
    nov: number;
    december: number;
    jan: number;
    feb: number;
    mar: number;
    apr: number;
    avg_consumption: number;
};

type SortKey = keyof User | 'avg_consumption';

const PAGE_SIZE = 10;

const HighConsumersTable: React.FC = () => {
    const [data, setData] = useState<User[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortKey, setSortKey] = useState<SortKey>('avg_consumption');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [commercialFilter, setCommercialFilter] = useState<'all' | 'yes' | 'no'>('all');

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/high-consumers');
                if (!res.ok) throw new Error(`HTTP error ${res.status}`);
                const json = await res.json();
                setData(json);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError(String(err));
                }
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const filteredData = data.filter((user) => {
        if (commercialFilter === 'yes') return user.isCommercial;
        if (commercialFilter === 'no') return !user.isCommercial;
        return true;
    });

    const sortedData = [...filteredData].sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];

        const isNumberKey = ['avg_consumption', 'accountId', 'roomsCount', 'residentsCount', 'totalArea', 'oct', 'nov', 'december', 'jan', 'feb', 'mar', 'apr'].includes(sortKey);

        if (isNumberKey) {
            const aNum = Number(aValue);
            const bNum = Number(bValue);
            return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortOrder === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        }

        if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
            return sortOrder === 'asc'
                ? Number(aValue) - Number(bValue)
                : Number(bValue) - Number(aValue);
        }

        return 0;
    });


    const totalPages = Math.ceil(sortedData.length / PAGE_SIZE);
    const paginatedData = sortedData.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const handleSort = (key: SortKey) => {
        if (key === sortKey) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    return (
        <div className="container_high_consumers">
            <h2>Потребители c потреблением более 3000 кВт·ч (окт-апр)</h2>

            <div style={{ marginBottom: 12 }}>
                <label className='filter'>
                    <span>Фильтр по типу:{" "}</span>
                    <select
                        value={commercialFilter}
                        onChange={(e) => setCommercialFilter(e.target.value as 'all' | 'yes' | 'no')}
                    >
                        <option value="all">Все</option>
                        <option value="yes">Коммерческие</option>
                        <option value="no">Некоммерческие</option>
                    </select>
                </label>
            </div>

            {loading && <p>Загрузка данных...</p>}
            {error && <p style={{ color: 'red' }}>Ошибка: {error}</p>}

            {!loading && !error && (
                <>
                    <table border={1} cellPadding={5} cellSpacing={0} style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('accountId')} style={{ cursor: 'pointer' }}>
                                    ID {sortKey === 'accountId' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                </th>
                                <th onClick={() => handleSort('isCommercial')} style={{ cursor: 'pointer' }}>
                                    Коммерческий {sortKey === 'isCommercial' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                </th>
                                <th onClick={() => handleSort('address')} style={{ cursor: 'pointer' }}>
                                    Адрес {sortKey === 'address' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                </th>
                                <th onClick={() => handleSort('buildingType')} style={{ cursor: 'pointer' }}>
                                    Тип здания {sortKey === 'buildingType' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                </th>
                                <th onClick={() => handleSort('roomsCount')} style={{ cursor: 'pointer' }}>
                                    Комнат {sortKey === 'roomsCount' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                </th>
                                <th onClick={() => handleSort('residentsCount')} style={{ cursor: 'pointer' }}>
                                    Жильцов {sortKey === 'residentsCount' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                </th>
                                <th onClick={() => handleSort('totalArea')} style={{ cursor: 'pointer' }}>
                                    Площадь {sortKey === 'totalArea' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                </th>
                                <th>Окт</th>
                                <th>Ноя</th>
                                <th>Дек</th>
                                <th>Янв</th>
                                <th>Фев</th>
                                <th>Мар</th>
                                <th>Апр</th>
                                <th onClick={() => handleSort('avg_consumption')} style={{ cursor: 'pointer' }}>
                                    Ср. потребл. (Окт-Апр){sortKey === 'avg_consumption' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={15} style={{ textAlign: 'center' }}>
                                        Нет данных
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((user) => (
                                    <tr key={user.accountId}>
                                        <td>{user.accountId}</td>
                                        <td>{user.isCommercial ? 'Да' : 'Нет'}</td>
                                        <td>{user.address}</td>
                                        <td>{user.buildingType}</td>
                                        <td>{user.roomsCount}</td>
                                        <td>{user.residentsCount}</td>
                                        <td>{user.totalArea}</td>
                                        <td>{user.oct}</td>
                                        <td>{user.nov}</td>
                                        <td>{user.december}</td>
                                        <td>{user.jan}</td>
                                        <td>{user.feb}</td>
                                        <td>{user.mar}</td>
                                        <td>{user.apr}</td>
                                        <td>{Number(user.avg_consumption).toFixed(2)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            ← Назад
                        </button>
                        <span>
                            Страница {currentPage} из {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Вперёд →
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default HighConsumersTable;
