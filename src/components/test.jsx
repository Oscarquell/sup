import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const CompareExcelNames = () => {
    const [missingOrExtraNames, setMissingOrExtraNames] = useState([]);

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
                const names1 = new Set(data1.map(row => row['FULL_NAME']));
                const names2 = new Set(data2.map(row => row['FULL_NAME']));

                // Find names in names1 that are not in names2
                const missingNames1 = [...names1].filter(name => !names2.has(name));
                // Find names in names2 that are not in names1
                const missingNames2 = [...names2].filter(name => !names1.has(name));

                // Combine missing names from both sets
                const allMissingOrExtraNames = [...missingNames1, ...missingNames2];
                setMissingOrExtraNames(allMissingOrExtraNames);
            })
            .catch(error => console.error('Ошибка при чтении файлов:', error));
    };

    return (
        <div>
            <h1>Сравнение файлов Excel по именам</h1>
            <input type="file" accept=".xlsx" multiple onChange={handleFileUpload} />
            <h2>Лишние или недостающие имена:</h2>
            {missingOrExtraNames.length > 0 ? (
                <ul>
                    {missingOrExtraNames.map((name, index) => (
                        <li key={index}>{name}</li>
                    ))}
                </ul>
            ) : (
                <p>Все имена совпадают или файлы не загружены</p>
            )}
        </div>
    );
};

export default CompareExcelNames;