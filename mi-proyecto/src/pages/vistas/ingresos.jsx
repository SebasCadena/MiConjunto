import React, { useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import Stack from "@mui/material/Stack";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";

const dataset = [
  { month: "Enero", seoul: 20 },
  { month: "Febrero", seoul: 30 },
  { month: "Marzo", seoul: 25 },
  { month: "Abril", seoul: 40 },
  { month: "Mayo", seoul: 35 },
];

const valueFormatter = (value) => `${value} mm`;

const chartSetting = {
  yAxis: [
    {
      label: "Lluvia (mm)",
      width: 60,
    },
  ],
  series: [{ dataKey: "seoul", label: "Lluvia en Seúl", valueFormatter }],
  height: 300,
};

const TickParamsSelector = ({
  tickPlacement,
  tickLabelPlacement,
  setTickPlacement,
  setTickLabelPlacement,
}) => {
  return (
    <Stack direction="column" justifyContent="space-between" sx={{ width: "100%" }}>
      <FormControl>
        <FormLabel id="tick-placement-radio-buttons-group-label">
          Posición de las marcas (tickPlacement)
        </FormLabel>
        <RadioGroup
          row
          aria-labelledby="tick-placement-radio-buttons-group-label"
          name="tick-placement"
          value={tickPlacement}
          onChange={(event) => setTickPlacement(event.target.value)}
        >
          <FormControlLabel value="start" control={<Radio />} label="Inicio" />
          <FormControlLabel value="end" control={<Radio />} label="Fin" />
          <FormControlLabel value="middle" control={<Radio />} label="Centro" />
          <FormControlLabel
            value="extremities"
            control={<Radio />}
            label="Extremos"
          />
        </RadioGroup>
      </FormControl>
      <FormControl>
        <FormLabel id="label-placement-radio-buttons-group-label">
          Posición de las etiquetas (tickLabelPlacement)
        </FormLabel>
        <RadioGroup
          row
          aria-labelledby="label-placement-radio-buttons-group-label"
          name="label-placement"
          value={tickLabelPlacement}
          onChange={(event) => setTickLabelPlacement(event.target.value)}
        >
          <FormControlLabel value="tick" control={<Radio />} label="En la marca" />
          <FormControlLabel value="middle" control={<Radio />} label="Centro" />
        </RadioGroup>
      </FormControl>
    </Stack>
  );
};

const Ingresos = () => {
  const [tickPlacement, setTickPlacement] = useState("middle");
  const [tickLabelPlacement, setTickLabelPlacement] = useState("middle");

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Resumen de Ingresos</h1>
      <p className="text-gray-600 mb-6">Aquí podrás consultar los ingresos generados.</p>
      <div className="mb-6">
        <TickParamsSelector
          tickPlacement={tickPlacement}
          tickLabelPlacement={tickLabelPlacement}
          setTickPlacement={setTickPlacement}
          setTickLabelPlacement={setTickLabelPlacement}
        />
      </div>
      <div className="overflow-x-auto">
        <BarChart
          dataset={dataset}
          xAxis={[{ dataKey: "month", tickPlacement, tickLabelPlacement }]}
          {...chartSetting}
        />
      </div>
    </div>
  );
};

export default Ingresos;