const centerTextPlugin = {
  id: 'centerTextPlugin',
  afterDraw(chart) {
    const { ctx, chartArea: { left, right, top, bottom, width, height } } = chart;
    ctx.save();

    // Get the total of the data
    const total = chart.data.datasets[0].data.reduce((sum, value) => sum + value, 0);

    // Calculate the center of the chart
    const centerX = (left + right) / 2;
    const centerY = (top + bottom) / 2;

    // Set font and color for the value
    ctx.font = 'bold 24px sans-serif'; // Adjust font size and style as needed
    ctx.fillStyle = '#000000'; // Black color
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw the total value inside the doughnut
    ctx.fillText(`$${total}`, centerX, centerY);
    
    ctx.restore();
  }
};