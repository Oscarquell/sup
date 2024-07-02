import React from 'react';
import {Route, Routes} from "react-router-dom";
import CompareExcelIDs from "../components/filter/filter";
import Concat from "../components/concat/concat";

const MainRoutes = () => {
    return (
    <Routes>
        <Route path={'/'} element={  <CompareExcelIDs />} />
        <Route path={'/concat'} element={  <Concat />} />
    </Routes>
    );
};

export default MainRoutes;