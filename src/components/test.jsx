import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const CompareExcelNames = () => {
    const [missingName, setMissingName] = useState(null);

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

                // Find the missing or extra name
                const missing = [...names1].find(name => !names2.has(name)) ||
                    [...names2].find(name => !names1.has(name));
                setMissingName(missing);
            })
            .catch(error => console.error('Ошибка при чтении файлов:', error));
    };

    return (
        <div>
            <h1>Сравнение файлов Excel по именам</h1>
            <input type="file" accept=".xlsx" multiple onChange={handleFileUpload} />
            <h2>Лишнее или недостающее имя:</h2>
            {missingName !== null ? <p>{missingName}</p> : <p>Загрузите файлы для сравнения</p>}
            <strong>test</strong>
        </div>
    );
};

export default CompareExcelNames;