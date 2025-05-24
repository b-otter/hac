


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

interface FileDataItem {
  accountId: number;
  isCommercial?: boolean;
  address: string;
  buildingType?: string;
  roomsCount?: number;
  residentsCount?: number;
  totalArea?: number;
  consumption?: { [key: string]: number };
}

function FileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [progress, setProgress] = useState(0);
  const [currentAddress, setCurrentAddress] = useState('');
  const [apiRequests, setApiRequests] = useState(0);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [commercialCount, setCommercialCount] = useState(0);
  const [nonCommercialCount, setNonCommercialCount] = useState(0);

  // Полный список коммерческих назначений из 2GIS API
  const COMMERCIAL_PURPOSES = [
    'административное здание',
    'бизнес центр',
    'гостиница',
    'торговый центр',
    'магазин',
    'офис',
    'ресторан',
    'кафе',
    'бар',
    'клиника',
    'салон красоты',
    'автосервис',
    'банк',
    'аптека',
    'кинотеатр',
    'фитнес клуб',
    'производство',
    'склад',
    'агентство',
    'сауна',
    'стоянка',
    'парковка',
    'магазин', 'супермаркет', 'гипермаркет', 'бутик', 'торговый центр', 'молл',
    'универмаг', 'гастроном', 'продуктовый', 'винный', 'одежда', 'обувь',
    'электроника', 'мебель', 'стройматериалы', 'хозтовары', 'детский мир',
    'ресторан', 'кафе', 'бар', 'бистро', 'кофейня', 'столовая', 'фастфуд',
    'пекарня', 'кондитерская', 'пиццерия', 'суши', 'шашлычная', 'блинная',
    'офис', 'бизнес центр', 'коворкинг', 'фирма', 'компания', 'корпорация',
    'банк', 'отделение', 'банкомат', 'обменник', 'страховая', 'инкассация',
    'салон красоты', 'парикмахерская', 'косметология', 'маникюр', 'педикюр',
    'спа', 'сауна', 'баня', 'массаж', 'солярий', 'фитнес', 'тренажерный зал',
    'клиника', 'медцентр', 'стоматология', 'аптека', 'оптика', 'гостиница',
    'отель', 'хостел', 'мотель', 'апартаменты', 'автосалон', 'автосервис',
    'шиномонтаж', 'мойка', 'заправка', 'стоянка', 'ателье', 'ремонт',
    'химчистка', 'прачечная', 'фотосалон', 'типография', 'копицентр', 'печати',
    'печать', 'музеи', 'музей', 'музеевый центр', 'музеевая коллекция',
    'музеевая выставка', 'музеевая экспоната', 'музеевая экспозиция',
    'музеевая выставка', 'музеевая экспозиция', 'музеевая экспоната',
    'музеевая коллекция', 'музеевый центр', 'музеи', 'развлекательное заведение',
    'конференц-зал', 'конференц-зал', 'конференц-зал', 'конференц-зал', 'магазин', 'супермаркет', 'гипермаркет', 'бутик', 'торговый центр', 'молл',
    'универмаг', 'гастроном', 'продуктовый', 'винный', 'одежда', 'обувь',
    'электроника', 'мебель', 'стройматериалы', 'хозтовары', 'детский мир',
    'косметика', 'парфюмерия', 'ювелирный', 'цветы', 'канцтовары', 'книги',
    'спорттовары', 'рынок', 'ярмарка', 'павильон', 'киоск', 'ларь', 'палатка',

    'ресторан', 'кафе', 'бар', 'бистро', 'кофейня', 'столовая', 'фастфуд',
    'пекарня', 'кондитерская', 'пиццерия', 'суши', 'шашлычная', 'блинная',
    'мороженое', 'кондитерская', 'кулинария', 'кулинария', 'гриль', 'стейк',
    'паб', 'пивная', 'винный бар', 'кальянная', 'кондитерская',
    'офис', 'бизнес центр', 'коворкинг', 'фирма', 'компания', 'корпорация',
    'предприятие', 'агентство', 'холдинг', 'филиал', 'представительство',
    'аренда офисов', 'юридический', 'консалтинг', 'маркетинг', 'реклама',
    'дизайн', 'разработка', 'it компания', 'стартап', 'инвестиции', 'лизинг',

    'банк', 'отделение', 'банкомат', 'обменник', 'страховая', 'инкассация',
    'кредит', 'ипотека', 'инвест', 'лизинг', 'финансы', 'касса', 'ломбард',
    'оценка', 'аудит', 'бухгалтерия', 'налоговая', 'пенсионный', 'страховой',

    'салон красоты', 'парикмахерская', 'косметология', 'маникюр', 'педикюр','Организация похорон',
    'визаж', 'стилист', 'барбершоп', 'тату', 'пирсинг', 'эпиляция', 'солярий',
    'спа', 'сауна', 'баня', 'массаж', 'фитнес', 'тренажерный зал', 'йога',
    'кроссфит', 'бассейн', 'клиника', 'медцентр', 'стоматология', 'аптека',
    'оптика', 'слуховой', 'ортопедия', 'реабилитация', 'лаборатория',


    'гостиница', 'отель', 'хостел', 'мотель', 'апартаменты', 'мини-отель',
    'курорт', 'база отдыха', 'пансионат', 'санаторий', 'дом отдыха', 'кемпинг',


    'автосалон', 'автосервис', 'шиномонтаж', 'мойка', 'заправка', 'стоянка',
    'парковка', 'каршеринг', 'такси', 'прокат авто', 'эвакуатор', 'разборка',
    'тюнинг', 'гараж', 'автозапчасти', 'автоэлектрика', 'автокондиционеры',


    'учебный центр', 'курсы', 'репетитор', 'языковая школа', 'автошкола',
    'компьютерные курсы', 'бухгалтерские курсы', 'дизайн курсы', 'программирование',
    'детский клуб', 'развивающий центр', 'подготовка к школе', 'музыкальная школа',
    'художественная школа', 'танцы', 'актерское мастерство',

    'кинотеатр', 'боулинг', 'бильярд', 'клуб', 'дискотека', 'караоке',
    'аттракционы', 'аквапарк', 'развлекательный центр', 'игровая зона',
    'тир', 'квест', 'виртуальная реальность', 'пейнтбол', 'лазертаг',
    'каток', 'ролледром', 'скалодром', 'батутный центр',


    'ателье', 'ремонт', 'химчистка', 'прачечная', 'фотосалон', 'типография',
    'копицентр', 'рекламное агентство', 'турагентство', 'доставка', 'логистика',
    'переезд', 'грузчики', 'сантехник', 'электрик', 'ремонт техники', 'ключи',
    'металлообработка', 'стекло', 'двери', 'окна', 'жалюзи', 'шторы',

    'завод', 'фабрика', 'цех', 'производство', 'мастерская', 'склад',
    'логистический комплекс', 'индустриальный парк', 'промзона', 'технопарк',
    'лаборатория', 'упаковка', 'печать', 'пошив', 'изготовление', 'сборка'


  ].map(p => p.toLowerCase());

  const addDebugLog = (log: string) => {
    console.log(log);
    setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${log}`]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        setSelectedFile(file);
        setMessage({ text: '', type: '' });
        setCommercialCount(0);
        setNonCommercialCount(0);
        addDebugLog(`Файл выбран: ${file.name}`);
      } else {
        setMessage({ text: 'Пожалуйста, выберите JSON файл', type: 'error' });
      }
    }
  };

  const checkWith2GIS = async (address: string): Promise<boolean> => {
    const API_KEY = '114df9f8-925b-48d6-91c2-96a27e3ae950';
    const url = `https://catalog.api.2gis.com/3.0/items/geocode?q=${encodeURIComponent(address)}&fields=items.purpose&key=${API_KEY}`;

    setCurrentAddress(address);
    addDebugLog(`Отправка запроса для: ${address}`);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const data = await response.json();
      setApiRequests(prev => prev + 1);
      addDebugLog(`Получен ответ от 2GIS: ${JSON.stringify(data)}`);

      if (data.result?.items?.length > 0) {
        const purposeName = data.result.items[0]?.purpose_name?.toLowerCase() || '';
        addDebugLog(`Назначение объекта: ${purposeName}`);

        // Проверяем есть ли purpose_name в нашем списке коммерческих назначений
        const isCommercial = COMMERCIAL_PURPOSES.some(
          commercialPurpose => purposeName.includes(commercialPurpose)
        );

        if (isCommercial) {
          addDebugLog(`Найдено совпадение: ${purposeName} → КОММЕРЧЕСКОЕ`);
          setCommercialCount(prev => prev + 1);
          return true;
        }
      }

      addDebugLog('Не найдено коммерческого назначения → НЕКОММЕРЧЕСКОЕ');
      setNonCommercialCount(prev => prev + 1);
      return false;
    } catch (error) {
      addDebugLog(`Ошибка API: ${error instanceof Error ? error.message : String(error)}`);
      setNonCommercialCount(prev => prev + 1);
      return false;
    } finally {
      setCurrentAddress('');
    }
  };

  const processFileData = async (fileData: FileDataItem[]) => {
    const results: FileDataItem[] = [];
    let checkedCount = 0;
    setCommercialCount(0);
    setNonCommercialCount(0);

    for (let i = 0; i < fileData.length; i++) {
      const item = fileData[i];
      setProgress(Math.round((i / fileData.length) * 100));

      if (item.isCommercial === undefined && item.address) {
        item.isCommercial = await checkWith2GIS(item.address);
        checkedCount++;
        await new Promise(resolve => setTimeout(resolve, 1100));
      }

      results.push(item);
    }

    addDebugLog(`Проверено ${checkedCount} адресов`);
    return results;
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage({ text: 'Пожалуйста, выберите файл', type: 'error' });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setApiRequests(0);
    setDebugLog([]);
    setMessage({ text: 'Начало обработки...', type: 'info' });

    try {
      const fileContent = await selectedFile.text();
      const jsonData: FileDataItem[] = JSON.parse(fileContent);

      if (!Array.isArray(jsonData)) {
        throw new Error('Неверный формат JSON: ожидается массив данных');
      }

      const processedData = await processFileData(jsonData);

      const formData = new FormData();
      formData.append('file', new Blob([JSON.stringify(processedData)], {
        type: 'application/json'
      }), selectedFile.name);

      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Ошибка сервера');

      const result = await response.json();
      setMessage({
        text: `Успешно! Обработано ${processedData.length} записей (${apiRequests} запросов к API)`,
        type: 'success'
      });
      setProgress(100);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      setMessage({ text: `Ошибка: ${errorMessage}`, type: 'error' });
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
            <p>Файл: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</p>
            <button
              onClick={handleUpload}
              disabled={isLoading}
              className={Styles.upload__button}
            >
              {isLoading ? `Обработка... ${progress}%` : 'Загрузить данные'}
            </button>
          </div>
        )}

        {isLoading && (
          <div className={Styles.progress_details}>
            <div className={Styles.progress__container}>
              <progress value={progress} max="100" />
              <span>{progress}%</span>
            </div>
            <div className={Styles.counters}>
              <span className={Styles.commercial}>Коммерческие: {commercialCount}</span>
              <span className={Styles.nonCommercial}>Некоммерческие: {nonCommercialCount}</span>
            </div>
            {currentAddress && (
              <p className={Styles.checking_address}>
                Проверка: "{currentAddress}"
              </p>
            )}
            <p>Запросов к API: {apiRequests}</p>
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