import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import './style.css';

const CompareExcelIDs = () => {
    const [results, setResults] = useState({ missing: [], duplicates: [] });

    const handleFileUpload = async (e) => {
        const files = e.target.files;
        if (files.length !== 2) {
            alert('Пожалуйста, загрузите два файла Excel.');
            return;
        }

        try {
            const data1 = await readFile(files[0]);
            const data2 = await readFile(files[1]);

            const ids1 = data1.map(row => row['ISSUANCE_ID']);
            const ids2 = data2.map(row => row['ISSUANCE_ID']);

            const { missing: missingInFirst, duplicates: duplicatesInFirst } = findMissingAndDuplicates(ids1, ids2);
            const { missing: missingInSecond, duplicates: duplicatesInSecond } = findMissingAndDuplicates(ids2, ids1);

            const missing = [...missingInFirst, ...missingInSecond];
            const duplicates = [...duplicatesInFirst, ...duplicatesInSecond];

            setResults({ missing, duplicates });
        } catch (error) {
            console.error('Ошибка при чтении файлов:', error);
        }
    };

    const readFile = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);
                resolve(json);
            };
            reader.onerror = (error) => reject(error);
            reader.readAsArrayBuffer(file);
        });
    };

    const findMissingAndDuplicates = (ids1, ids2) => {
        const idsSet2 = new Set(ids2);
        const missing = ids1.filter(id => !idsSet2.has(id));
        const duplicates = ids1.filter((id, index, self) => self.indexOf(id) !== index);
        return { missing, duplicates };
    };

    return (
        <div className='filter-wrap'>
            <h1 className='filter-title'>Сравнение файлов Excel по ISSUANCE_ID</h1>
            <input className='filter-input-files' type="file" accept=".xlsx" multiple onChange={handleFileUpload} />
            <h2>Лишние или отсутствующие ID:</h2>
            {results.missing.length > 0 ? (
                <ul>
                    {results.missing.map((id, index) => (
                        <span className='filter-issuances' key={index}>{id}</span>
                    ))}
                </ul>
            ) : (
                <p>Нет лишних или отсутствующих ID</p>
            )}
            <h2>Дублирующиеся ID:</h2>
            {results.duplicates.length > 0 ? (
                <ul>
                    {results.duplicates.map((id, index) => (
                        <span className='filter-issuances' key={index}>{id}</span>
                    ))}
                </ul>
            ) : (
                <p>Нет дублирующихся ID</p>
            )}
        </div>
    );
};

export default CompareExcelIDs;
