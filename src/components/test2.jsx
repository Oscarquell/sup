import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const CompareExcelNames = () => {
    const [unpairedNames, setUnpairedNames] = useState([]);

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
                const names1 = data1.map(row => row['FULL_NAME']);
                const names2 = data2.map(row => row['FULL_NAME']);

                const nameCount1 = names1.reduce((acc, name) => {
                    acc[name] = (acc[name] || 0) + 1;
                    return acc;
                }, {});

                const nameCount2 = names2.reduce((acc, name) => {
                    acc[name] = (acc[name] || 0) + 1;
                    return acc;
                }, {});

                const unpaired = [];

                for (const [name, count] of Object.entries(nameCount1)) {
                    if (!nameCount2[name] || nameCount2[name] < count) {
                        const diff = count - (nameCount2[name] || 0);
                        for (let i = 0; i < diff; i++) {
                            unpaired.push(name);
                        }
                    }
                }
                for (const [name, count] of Object.entries(nameCount2)) {
                    if (!nameCount1[name] || nameCount1[name] < count) {
                        const diff = count - (nameCount1[name] || 0);
                        for (let i = 0; i < diff; i++) {
                            unpaired.push(name);
                        }
                    }
                }

                setUnpairedNames(unpaired);
            })
            .catch(error => console.error('Ошибка при чтении файлов:', error));
    };

    return (
        <div>
            <h1>Сравнение файлов Excel по именам</h1>
            <input type="file" accept=".xlsx" multiple onChange={handleFileUpload} />
            <h2>Люди без пары:</h2>
            {unpairedNames.length > 0 ? (
                <ul>
                    {unpairedNames.map((name, index) => (
                        <li key={index}>{name}</li>
                    ))}
                </ul>
            ) : (
                <p>Все имена имеют пары или файлы не загружены</p>
            )}
        </div>
    );
};

export default CompareExcelNames;
