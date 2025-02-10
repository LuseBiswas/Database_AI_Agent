import React from 'react';
import { 
  PieChart, Pie, BarChart, Bar, 
  LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const ChartRenderer = ({ data, chartType = 'bar' }) => {
  if (!data?.rows || data.rows.length === 0) return null;

  const chartData = data.rows;
  const columns = Object.keys(chartData[0]);

  // Determine appropriate columns for visualization
  const labelColumn = columns[0];
  const valueColumn = columns[1] || columns[0];

  const renderChart = () => {
    switch (chartType) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey={valueColumn}
                nameKey={labelColumn}
                fill="#8884d8"
                label={({ name, value }) => `${name}: ${value}`}
              />
              <Tooltip formatter={(value, name) => [value, name]} />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={labelColumn} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={valueColumn} fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={labelColumn} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={valueColumn} stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visualization</CardTitle>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default ChartRenderer;