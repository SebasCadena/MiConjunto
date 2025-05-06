import React, { useState, useEffect } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { useDrawingArea } from "@mui/x-charts/hooks";
import { styled } from "@mui/material/styles";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

const valueFormatter = (value) => `$${value}`;

const chartSetting = {
  yAxis: [
    {
      label: "Monto Pagado ($)",
      width: 50,
    },
  ],
  height: 250,
};

const StyledText = styled("text")(({ theme }) => ({
  fill: theme.palette.text.primary,
  textAnchor: "middle",
  dominantBaseline: "central",
  fontSize: 14,
}));

function PieCenterLabel({ children }) {
  const { width, height, left, top } = useDrawingArea();
  return (
    <StyledText x={left + width / 2} y={top + height / 2}>
      {children}
    </StyledText>
  );
}

const Ingresos = () => {
  const [datasetByMonth, setDatasetByMonth] = useState([]);
  const [datasetByYear, setDatasetByYear] = useState([]);
  const [paymentMethodsData, setPaymentMethodsData] = useState([]);
  const [datasetByMetodo, setDatasetByMetodo] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    const fetchPagos = async () => {
      try {
        const pagosSnapshot = await getDocs(collection(db, "pagos"));
        const pagos = pagosSnapshot.docs.map((doc) => doc.data());

        const years = [...new Set(pagos.map((pago) => new Date(pago.fecha_pago.seconds * 1000).getFullYear()))];
        setAvailableYears(years);

        const mesesOrdenados = [
          "enero",
          "febrero",
          "marzo",
          "abril",
          "mayo",
          "junio",
          "julio",
          "agosto",
          "septiembre",
          "octubre",
          "noviembre",
          "diciembre",
        ];

        const pagosPorMes = pagos.reduce((acc, pago) => {
          const fecha = new Date(pago.fecha_pago.seconds * 1000);
          const mes = fecha.toLocaleString("es-ES", { month: "long" }).toLowerCase();
          const year = fecha.getFullYear();

          if (year === selectedYear) {
            acc[mes] = (acc[mes] || 0) + pago.montoPagado;
          }
          return acc;
        }, {});

        const datasetByMonth = mesesOrdenados
          .filter((mes) => pagosPorMes[mes])
          .map((mes) => ({
            month: mes.charAt(0).toUpperCase() + mes.slice(1),
            total: pagosPorMes[mes],
          }));

        setDatasetByMonth(datasetByMonth);

        const pagosPorAno = pagos.reduce((acc, pago) => {
          const fecha = new Date(pago.fecha_pago.seconds * 1000);
          const year = fecha.getFullYear();
          acc[year] = (acc[year] || 0) + pago.montoPagado;
          return acc;
        }, {});

        const datasetByYear = Object.entries(pagosPorAno).map(([year, total]) => ({
          year: parseInt(year),
          total,
        }));

        setDatasetByYear(datasetByYear);

        const dineroPorMetodo = pagos.reduce((acc, pago) => {
          const metodo = pago.metodoPago || "Desconocido";
          acc[metodo] = (acc[metodo] || 0) + (pago.montoPagado || 0);
          return acc;
        }, {});

        const datasetByMetodo = Object.entries(dineroPorMetodo).map(([metodo, total]) => ({
          metodo,
          total,
        }));

        setDatasetByMetodo(datasetByMetodo);

        const methodsCount = pagos.reduce((acc, pago) => {
          const metodo = pago.metodoPago || "Desconocido";
          acc[metodo] = (acc[metodo] || 0) + 1;
          return acc;
        }, {});

        const paymentMethodsData = Object.entries(methodsCount).map(([method, count]) => ({
          id: method,
          value: count,
          label: method,
        }));

        setPaymentMethodsData(paymentMethodsData);
      } catch (error) {
        console.error("Error al obtener los pagos:", error);
      }
    };

    fetchPagos();
  }, [selectedYear]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h1 className="text-xl font-bold text-gray-800 mb-3">Resumen de Ingresos</h1>
      <p className="text-gray-600 mb-4 text-sm">Consulta los ingresos generados por año y mes.</p>

      <div className="mb-4">
        <label htmlFor="year-select" className="block text-gray-700 font-medium mb-1 text-sm">
          Seleccionar Año:
        </label>
        <select
          id="year-select"
          className="form-select w-full p-1 border border-gray-300 rounded-md text-sm"
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Tarjeta de pagos por mes */}
        <div className="p-4 bg-gray-50 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Pagos por Mes</h2>
          <BarChart
            dataset={datasetByMonth}
            xAxis={[{ dataKey: "month" }]}
            series={[{ dataKey: "total", label: "Ingresos", valueFormatter }]}
            {...chartSetting}
          />
        </div>

        {/* Tarjeta de pagos por año */}
        <div className="p-4 bg-gray-50 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Pagos por Año</h2>
          <BarChart
            dataset={datasetByYear}
            xAxis={[{ dataKey: "year" }]}
            series={[{ dataKey: "total", label: "Ingresos", valueFormatter }]}
            {...chartSetting}
          />
        </div>

        {/* Tarjeta de métodos de pago (diagrama de pastel) */}
        <div className="p-4 bg-gray-50 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Métodos de Pago</h2>
          <div className="flex justify-center items-center">
            <PieChart
              series={[
                {
                  data: paymentMethodsData,
                  innerRadius: 80,
                },
              ]}
              width={200}
              height={200}
            >
              <PieCenterLabel>Métodos</PieCenterLabel>
            </PieChart>
          </div>
        </div>

        {/* Tarjeta de dinero por método de pago (gráfico de barras) */}
        <div className="p-4 bg-gray-50 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Dinero por Método de Pago</h2>
          {datasetByMetodo.length > 0 ? (
            <BarChart
              dataset={datasetByMetodo}
              xAxis={[{ dataKey: "metodo" }]}
              series={[{ dataKey: "total", label: "Dinero", valueFormatter }]}
              height={300}
            />
          ) : (
            <p className="text-gray-500 text-sm">Cargando datos...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ingresos;