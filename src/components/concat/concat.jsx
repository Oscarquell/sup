import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function Concat() {
    const [file1, setFile1] = useState(null);
    const [file2, setFile2] = useState(null);

    const handleFile1Change = (e) => {
        setFile1(e.target.files[0]);
    };

    const handleFile2Change = (e) => {
        setFile2(e.target.files[0]);
    };

    const handleMerge = () => {
        if (file1 && file2) {
            const reader1 = new FileReader();
            const reader2 = new FileReader();

            reader1.onload = (e) => {
                const data1 = new Uint8Array(e.target.result);
                const workbook1 = XLSX.read(data1, { type: 'array' });
                const sheet1 = workbook1.Sheets[workbook1.SheetNames[0]];
                const json1 = XLSX.utils.sheet_to_json(sheet1);

                reader2.onload = (e) => {
                    const data2 = new Uint8Array(e.target.result);
                    const workbook2 = XLSX.read(data2, { type: 'array' });
                    const sheet2 = workbook2.Sheets[workbook2.SheetNames[0]];
                    const json2 = XLSX.utils.sheet_to_json(sheet2);

                    const combinedData = [...json1, ...json2];

                    const newSheet = XLSX.utils.json_to_sheet(combinedData);
                    const newWorkbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(newWorkbook, newSheet, 'CombinedSheet');

                    const wbout = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'array' });
                    const blob = new Blob([wbout], { type: 'application/octet-stream' });

                    saveAs(blob, 'combined_file.xlsx');
                };

                reader2.readAsArrayBuffer(file2);
            };

            reader1.readAsArrayBuffer(file1);
        } else {
            alert('Please select both files');
        }
    };

    return (
        <div className="App">
            <h1>Excel Files Merger</h1>
            <input type="file" onChange={handleFile1Change} />
            <input type="file" onChange={handleFile2Change} />
            <button onClick={handleMerge}>Merge Files</button>
        </div>
    );
}

export default Concat;
