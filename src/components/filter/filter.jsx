import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const CompareExcelIDs = () => {
    const [extraIDs, setExtraIDs] = useState([]);

    const handleFileUpload = (e) => {
        const files = e.target.files;
        if (files.length !== 2) {
            alert('Пожалуйста, загрузите два файла Excel.');
            return;
        }

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

        Promise.all([readFile(files[0]), readFile(files[1])])
            .then(([data1, data2]) => {
                const ids1 = data1.map(row => row['ISSUANCE_ID']);
                const ids2 = data2.map(row => row['ISSUANCE_ID']);

                const idsSet1 = new Set(ids1);
                const idsSet2 = new Set(ids2);

                const extraInFirst = ids1.filter(id => !idsSet2.has(id));
                const extraInSecond = ids2.filter(id => !idsSet1.has(id));

                const allExtraIDs = [...new Set([...extraInFirst, ...extraInSecond])];
                setExtraIDs(allExtraIDs);
            })
            .catch(error => console.error('Ошибка при чтении файлов:', error));
    };

    return (
        <div>
            <h1>Сравнение файлов Excel по ISSUANCE_ID</h1>
            <input type="file" accept=".xlsx" multiple onChange={handleFileUpload} />
            <h2>Лишние ID:</h2>
            {extraIDs.length > 0 ? (
                <ul>
                    {extraIDs.map((id, index) => (
                        <li key={index}>{id}</li>
                    ))}
                </ul>
            ) : (
                <p>Загрузите файлы для сравнения</p>
            )}
        </div>
    );
};

export default CompareExcelIDs;
