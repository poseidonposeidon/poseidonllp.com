document.getElementById('stockSymbol').addEventListener('input', function(e) {
    e.target.value = e.target.value.toUpperCase();
});

function fetchStock() {
    const stockSymbol = document.getElementById('stockSymbol').value.trim().toUpperCase();
    const previousSymbol = document.getElementById('outputSymbol').getAttribute('data-last-symbol');

    if (stockSymbol !== previousSymbol) {
        document.getElementById('outputSymbol').innerText = '現在查詢的是：' + stockSymbol;
        document.getElementById('outputSymbol').setAttribute('data-last-symbol', stockSymbol);

        const containers = [
            'incomeStatementContainer',
            'balanceSheetContainer',
            'cashflowContainer',
            'earningsCallTranscriptContainer',
            'earningsCallCalendarContainer',
            'historicalEarningsContainer',
            'stockDividendCalendarContainer',
            'insiderTradesContainer'
        ];

        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '';
            }
        });

        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.classList.remove('fixed');
            collapseSection(section);
        });
    }

    return stockSymbol;
}


/////////////////縮放///////////
function expandSection(element) {
    const content = element.querySelector('.content');
    if (!element.classList.contains('fixed')) {
        content.style.maxHeight = '1000px';
        content.style.opacity = '1';
        content.style.paddingTop = '20px';
        content.style.paddingBottom = '20px';
    }
}

function collapseSection(element) {
    const content = element.querySelector('.content');
    if (!element.classList.contains('fixed')) {
        content.style.maxHeight = '0px';
        content.style.opacity = '0';
        content.style.paddingTop = '0';
        content.style.paddingBottom = '0';
    }
}

function toggleFixed(event, element) {
    if (event.target.tagName === 'SELECT' || event.target.tagName === 'BUTTON' || event.target.tagName === 'INPUT') {
        return;
    }
    const content = element.querySelector('.content');
    if (content.style.maxHeight !== '0px' && !element.classList.contains('fixed')) {
        element.classList.add('fixed');
    } else {
        element.classList.remove('fixed');
        collapseSection(element);
    }
}


//////////////財務收入 Income Statement/////////////////
function fetchIncomeStatement() {
    stockSymbol = fetchStock();
    const period = document.getElementById('period').value;  // 獲取選擇的時段
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/income-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_IncomeStatement(apiUrl, displayIncomeStatement, 'incomeStatementContainer');
}

function displayIncomeStatement(data, container) {
    if (!data || !Array.isArray(data) || data.length === 0) {
        container.innerHTML = '<p>Data not available.</p>';
        const expandButton = document.getElementById('expandButton_Income');
        if (expandButton) expandButton.style.display = 'none'; // 隐藏按钮
        const collapseButton = document.getElementById('collapseButton_Income');
        if (collapseButton) collapseButton.style.display = 'none';
        return;
    }

    let rows = {
        date: ['Date'],
        symbol: ['Symbol'],
        reportedCurrency: ['Reported Currency'],
        cik: ['CIK'],
        fillingDate: ['Filling Date'],
        acceptedDate: ['Accepted Date'],
        calendarYear: ['Calendar Year'],
        period: ['Period'],
        revenue: ['Revenue'],
        costOfRevenue: ['Cost of Revenue'],
        grossProfit: ['Gross Profit'],
        grossProfitRatio: ['Gross Profit Ratio'],
        researchAndDevelopmentExpenses: ['Research and Development Expenses'],
        generalAndAdministrativeExpenses: ['General and Administrative Expenses'],
        sellingAndMarketingExpenses: ['Selling and Marketing Expenses'],
        sellingGeneralAndAdministrativeExpenses: ['Selling, General and Administrative Expenses'],
        otherExpenses: ['Other Expenses'],
        operatingExpenses: ['Operating Expenses'],
        costAndExpenses: ['Cost and Expenses'],
        interestIncome: ['Interest Income'],
        interestExpense: ['Interest Expense'],
        depreciationAndAmortization: ['Depreciation and Amortization'],
        ebitda: ['EBITDA'],
        ebitdaratio: ['EBITDA Ratio'],
        operatingIncome: ['Operating Income'],
        operatingIncomeRatio: ['Operating Income Ratio'],
        totalOtherIncomeExpensesNet: ['Total Other Income Expenses Net'],
        incomeBeforeTax: ['Income Before Tax'],
        incomeBeforeTaxRatio: ['Income Before Tax Ratio'],
        incomeTaxExpense: ['Income Tax Expense'],
        netIncome: ['Net Income'],
        netIncomeRatio: ['Net Income Ratio'],
        eps: ['EPS'],
        epsdiluted: ['EPS Diluted'],
        weightedAverageShsOut: ['Weighted Average Shares Outstanding'],
        weightedAverageShsOutDil: ['Weighted Average Shares Outstanding Diluted'],
        link: ['Report Link'],
        finalLink: ['Final Link']
    };

    // 填充行数据
    data.forEach(entry => {
        rows.date.push(entry.date || 'N/A');
        rows.symbol.push(entry.symbol || 'N/A');
        rows.reportedCurrency.push(entry.reportedCurrency || 'N/A');
        rows.cik.push(entry.cik || 'N/A');
        rows.fillingDate.push(entry.fillingDate || 'N/A');
        rows.acceptedDate.push(entry.acceptedDate || 'N/A');
        rows.calendarYear.push(entry.calendarYear || 'N/A');
        rows.period.push(entry.period || 'N/A');
        rows.revenue.push(formatNumber(entry.revenue));
        rows.costOfRevenue.push(formatNumber(entry.costOfRevenue));
        rows.grossProfit.push(formatNumber(entry.grossProfit));
        rows.grossProfitRatio.push(entry.grossProfitRatio ? (entry.grossProfitRatio * 100).toFixed(2) + '%' : 'N/A');
        rows.researchAndDevelopmentExpenses.push(formatNumber(entry.researchAndDevelopmentExpenses));
        rows.generalAndAdministrativeExpenses.push(formatNumber(entry.generalAndAdministrativeExpenses));
        rows.sellingAndMarketingExpenses.push(formatNumber(entry.sellingAndMarketingExpenses));
        rows.sellingGeneralAndAdministrativeExpenses.push(formatNumber(entry.sellingGeneralAndAdministrativeExpenses));
        rows.otherExpenses.push(formatNumber(entry.otherExpenses));
        rows.operatingExpenses.push(formatNumber(entry.operatingExpenses));
        rows.costAndExpenses.push(formatNumber(entry.costAndExpenses));
        rows.interestIncome.push(formatNumber(entry.interestIncome));
        rows.interestExpense.push(formatNumber(entry.interestExpense));
        rows.depreciationAndAmortization.push(formatNumber(entry.depreciationAndAmortization));
        rows.ebitda.push(formatNumber(entry.ebitda));
        rows.ebitdaratio.push(entry.ebitdaratio ? (entry.ebitdaratio * 100).toFixed(2) + '%' : 'N/A');
        rows.operatingIncome.push(formatNumber(entry.operatingIncome));
        rows.operatingIncomeRatio.push(entry.operatingIncomeRatio ? (entry.operatingIncomeRatio * 100).toFixed(2) + '%' : 'N/A');
        rows.totalOtherIncomeExpensesNet.push(formatNumber(entry.totalOtherIncomeExpensesNet));
        rows.incomeBeforeTax.push(formatNumber(entry.incomeBeforeTax));
        rows.incomeBeforeTaxRatio.push(entry.incomeBeforeTaxRatio ? (entry.incomeBeforeTaxRatio * 100).toFixed(2) + '%' : 'N/A');
        rows.incomeTaxExpense.push(formatNumber(entry.incomeTaxExpense));
        rows.netIncome.push(formatNumber(entry.netIncome));
        rows.netIncomeRatio.push(entry.netIncomeRatio ? (entry.netIncomeRatio * 100).toFixed(2) + '%' : 'N/A');
        rows.eps.push(entry.eps || 'N/A');
        rows.epsdiluted.push(entry.epsdiluted || 'N/A');
        rows.weightedAverageShsOut.push(formatNumber(entry.weightedAverageShsOut));
        rows.weightedAverageShsOutDil.push(formatNumber(entry.weightedAverageShsOutDil));
        rows.link.push(`<a href="${entry.link}" target="_blank">View Report</a>`);
        rows.finalLink.push(`<a href="${entry.finalLink}" target="_blank">Final Report</a>`);
    });

    // 构建 HTML 表格
    let htmlContent = '<table border="1" style="width: 100%; border-collapse: collapse;">';
    Object.keys(rows).forEach(key => {
        htmlContent += `<tr><th>${rows[key][0]}</th>`;
        rows[key].slice(1).forEach(value => {
            htmlContent += `<td>${value}</td>`;
        });
        htmlContent += '</tr>';
    });
    htmlContent += '</table>';

    container.innerHTML = htmlContent;
    const expandButton = document.getElementById('expandButton_Income');
    if (expandButton) expandButton.style.display = 'inline'; // 显示 Read More 按钮
}

function fetchData_IncomeStatement(apiUrl, callback, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '<p>Loading...</p>';
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // 檢查回應資料是否為 undefined 或非陣列
            if (data === undefined || !Array.isArray(data)) {
                container.innerHTML = '<p>Error loading data: Data is not an array or is undefined.</p>';
            } else {
                if (data.length > 0) {
                    callback(data, container);  // 修改這裡以傳遞整個數據陣列
                } else {
                    container.innerHTML = '<p>No data found for this symbol.</p>';
                }
            }
        })
        .catch(error => {
            console.error('Error fetching data: ', error);
            container.innerHTML = '<p>Error loading data. Please check the console for more details.</p>';
        });
}

function formatNumber(value) {
    // Check if the value is numeric and format it, otherwise return 'N/A'
    return value != null && !isNaN(value) ? parseFloat(value).toLocaleString('en-US') : 'N/A';
}

//////////////////////////////////////////////////資產負債表Balance Sheet Statements////////////////////////////////
function fetchBalanceSheet() {
    stockSymbol = fetchStock();
    const period = document.getElementById('period_2').value;  // 獲取選擇的時段
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_BalanceSheet(apiUrl, displayBalanceSheet, 'balanceSheetContainer');
}

function displayBalanceSheet(data, container) {
    if (!data || !Array.isArray(data) || data.length === 0) {
        container.innerHTML = '<p>Data not available.</p>';
        const expandButton = document.getElementById('expandButton_Balance');
        if (expandButton) expandButton.style.display = 'none'; // 隐藏按钮
        const collapseButton = document.getElementById('collapseButton_Balance');
        if (collapseButton) collapseButton.style.display = 'none';
        return;
    }

    let rows = {
        date: ['Date'],
        symbol: ['Symbol'],
        reportedCurrency: ['Reported Currency'],
        cik: ['CIK'],
        fillingDate: ['Filling Date'],
        acceptedDate: ['Accepted Date'],
        calendarYear: ['Calendar Year'],
        period: ['Period'],
        cashAndCashEquivalents: ['Cash and Cash Equivalents'],
        shortTermInvestments: ['Short Term Investments'],
        cashAndShortTermInvestments: ['Cash and Short Term Investments'],
        netReceivables: ['Net Receivables'],
        inventory: ['Inventory'],
        otherCurrentAssets: ['Other Current Assets'],
        totalCurrentAssets: ['Total Current Assets'],
        propertyPlantEquipmentNet: ['Property Plant Equipment Net'],
        goodwill: ['Goodwill'],
        intangibleAssets: ['Intangible Assets'],
        goodwillAndIntangibleAssets: ['Goodwill and Intangible Assets'],
        longTermInvestments: ['Long Term Investments'],
        taxAssets: ['Tax Assets'],
        otherNonCurrentAssets: ['Other Non-Current Assets'],
        totalNonCurrentAssets: ['Total Non-Current Assets'],
        otherAssets: ['Other Assets'],
        totalAssets: ['Total Assets'],
        accountPayables: ['Account Payables'],
        shortTermDebt: ['Short Term Debt'],
        taxPayables: ['Tax Payables'],
        deferredRevenue: ['Deferred Revenue'],
        otherCurrentLiabilities: ['Other Current Liabilities'],
        totalCurrentLiabilities: ['Total Current Liabilities'],
        longTermDebt: ['Long Term Debt'],
        deferredRevenueNonCurrent: ['Deferred Revenue Non-Current'],
        deferredTaxLiabilitiesNonCurrent: ['Deferred Tax Liabilities Non-Current'],
        otherNonCurrentLiabilities: ['Other Non-Current Liabilities'],
        totalNonCurrentLiabilities: ['Total Non-Current Liabilities'],
        otherLiabilities: ['Other Liabilities'],
        capitalLeaseObligations: ['Capital Lease Obligations'],
        totalLiabilities: ['Total Liabilities'],
        preferredStock: ['Preferred Stock'],
        commonStock: ['Common Stock'],
        retainedEarnings: ['Retained Earnings'],
        accumulatedOtherComprehensiveIncomeLoss: ['Accumulated Other Comprehensive Income Loss'],
        othertotalStockholdersEquity: ['Other Total Stockholders Equity'],
        totalStockholdersEquity: ['Total Stockholders Equity'],
        totalEquity: ['Total Equity'],
        totalLiabilitiesAndStockholdersEquity: ['Total Liabilities and Stockholders Equity'],
        minorityInterest: ['Minority Interest'],
        totalLiabilitiesAndTotalEquity: ['Total Liabilities and Total Equity'],
        totalInvestments: ['Total Investments'],
        totalDebt: ['Total Debt'],
        netDebt: ['Net Debt'],
        link: ['Report Link'],
        finalLink: ['Final Link']
    };

    // 填充行数据
    data.forEach(entry => {
        rows.date.push(entry.date || 'N/A');
        rows.symbol.push(entry.symbol || 'N/A');
        rows.reportedCurrency.push(entry.reportedCurrency || 'N/A');
        rows.cik.push(entry.cik || 'N/A');
        rows.fillingDate.push(entry.fillingDate || 'N/A');
        rows.acceptedDate.push(entry.acceptedDate || 'N/A');
        rows.calendarYear.push(entry.calendarYear || 'N/A');
        rows.period.push(entry.period || 'N/A');
        rows.cashAndCashEquivalents.push(formatNumber(entry.cashAndCashEquivalents));
        rows.shortTermInvestments.push(formatNumber(entry.shortTermInvestments));
        rows.cashAndShortTermInvestments.push(formatNumber(entry.cashAndShortTermInvestments));
        rows.netReceivables.push(formatNumber(entry.netReceivables));
        rows.inventory.push(formatNumber(entry.inventory));
        rows.otherCurrentAssets.push(formatNumber(entry.otherCurrentAssets));
        rows.totalCurrentAssets.push(formatNumber(entry.totalCurrentAssets));
        rows.propertyPlantEquipmentNet.push(formatNumber(entry.propertyPlantEquipmentNet));
        rows.goodwill.push(formatNumber(entry.goodwill));
        rows.intangibleAssets.push(formatNumber(entry.intangibleAssets));
        rows.goodwillAndIntangibleAssets.push(formatNumber(entry.goodwillAndIntangibleAssets));
        rows.longTermInvestments.push(formatNumber(entry.longTermInvestments));
        rows.taxAssets.push(formatNumber(entry.taxAssets));
        rows.otherNonCurrentAssets.push(formatNumber(entry.otherNonCurrentAssets));
        rows.totalNonCurrentAssets.push(formatNumber(entry.totalNonCurrentAssets));
        rows.otherAssets.push(formatNumber(entry.otherAssets));
        rows.totalAssets.push(formatNumber(entry.totalAssets));
        rows.accountPayables.push(formatNumber(entry.accountPayables));
        rows.shortTermDebt.push(formatNumber(entry.shortTermDebt));
        rows.taxPayables.push(formatNumber(entry.taxPayables));
        rows.deferredRevenue.push(formatNumber(entry.deferredRevenue));
        rows.otherCurrentLiabilities.push(formatNumber(entry.otherCurrentLiabilities));
        rows.totalCurrentLiabilities.push(formatNumber(entry.totalCurrentLiabilities));
        rows.longTermDebt.push(formatNumber(entry.longTermDebt));
        rows.deferredRevenueNonCurrent.push(formatNumber(entry.deferredRevenueNonCurrent));
        rows.deferredTaxLiabilitiesNonCurrent.push(formatNumber(entry.deferredTaxLiabilitiesNonCurrent));
        rows.otherNonCurrentLiabilities.push(formatNumber(entry.otherNonCurrentLiabilities));
        rows.totalNonCurrentLiabilities.push(formatNumber(entry.totalNonCurrentLiabilities));
        rows.otherLiabilities.push(formatNumber(entry.otherLiabilities));
        rows.capitalLeaseObligations.push(formatNumber(entry.capitalLeaseObligations));
        rows.totalLiabilities.push(formatNumber(entry.totalLiabilities));
        rows.preferredStock.push(formatNumber(entry.preferredStock));
        rows.commonStock.push(formatNumber(entry.commonStock));
        rows.retainedEarnings.push(formatNumber(entry.retainedEarnings));
        rows.accumulatedOtherComprehensiveIncomeLoss.push(formatNumber(entry.accumulatedOtherComprehensiveIncomeLoss));
        rows.othertotalStockholdersEquity.push(formatNumber(entry.othertotalStockholdersEquity));
        rows.totalStockholdersEquity.push(formatNumber(entry.totalStockholdersEquity));
        rows.totalEquity.push(formatNumber(entry.totalEquity));
        rows.totalLiabilitiesAndStockholdersEquity.push(formatNumber(entry.totalLiabilitiesAndStockholdersEquity));
        rows.minorityInterest.push(formatNumber(entry.minorityInterest));
        rows.totalLiabilitiesAndTotalEquity.push(formatNumber(entry.totalLiabilitiesAndTotalEquity));
        rows.totalInvestments.push(formatNumber(entry.totalInvestments));
        rows.totalDebt.push(formatNumber(entry.totalDebt));
        rows.netDebt.push(formatNumber(entry.netDebt));
        rows.link.push(`<a href="${entry.link}" target="_blank">View Report</a>`);
        rows.finalLink.push(`<a href="${entry.finalLink}" target="_blank">Final Report</a>`);
    });

    // 构建 HTML 表格
    let htmlContent = '<table border="1" style="width: 100%; border-collapse: collapse;">';
    Object.keys(rows).forEach(key => {
        htmlContent += `<tr><th>${rows[key][0]}</th>`;
        rows[key].slice(1).forEach(value => {
            htmlContent += `<td>${value}</td>`;
        });
        htmlContent += '</tr>';
    });
    htmlContent += '</table>';

    container.innerHTML = htmlContent;
    const expandButton = document.getElementById('expandButton_Balance');
    if (expandButton) expandButton.style.display = 'inline'; // 显示 Read More 按钮
}

function fetchData_BalanceSheet(apiUrl, callback, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '<p>Loading...</p>';
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // 檢查回應資料是否為 undefined 或非陣列
            if (data === undefined || !Array.isArray(data)) {
                container.innerHTML = '<p>Error loading data: Data is not an array or is undefined.</p>';
            } else {
                if (data.length > 0) {
                    callback(data, container);  // 修改這裡以傳遞整個數據陣列
                } else {
                    container.innerHTML = '<p>No data found for this symbol.</p>';
                }
            }
        })
        .catch(error => {
            console.error('Error fetching data: ', error);
            container.innerHTML = '<p>Error loading data. Please check the console for more details.</p>';
        });
}

function formatNumber(value) {
    // Check if the value is numeric and format it, otherwise return 'N/A'
    return value != null && !isNaN(value) ? parseFloat(value).toLocaleString('en-US') : 'N/A';
}



///////////////////////////////////現金流表Cashflow///////////////
function fetchCashflow() {
    const stockSymbol = fetchStock();
    const period = document.getElementById('period_3').value;  // 獲取選擇的時段
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/cash-flow-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_Cashflow(apiUrl, displayCashflow, 'cashflowContainer');
}

function displayCashflow(data, container) {
    if (!data || !Array.isArray(data) || data.length === 0) {
        container.innerHTML = '<p>Data not available.</p>';
        const expandButton = document.getElementById('expandButton_Cashflow');
        if (expandButton) expandButton.style.display = 'none'; // 隐藏按钮
        const collapseButton = document.getElementById('collapseButton_Cashflow');
        if (collapseButton) collapseButton.style.display = 'none';
        return;
    }

    let rows = {
        date: ['Date'],
        symbol: ['Symbol'],
        reportedCurrency: ['Reported Currency'],
        cik: ['CIK'],
        fillingDate: ['Filling Date'],
        acceptedDate: ['Accepted Date'],
        calendarYear: ['Calendar Year'],
        period: ['Period'],
        netIncome: ['Net Income'],
        depreciationAndAmortization: ['Depreciation and Amortization'],
        deferredIncomeTax: ['Deferred Income Tax'],
        stockBasedCompensation: ['Stock Based Compensation'],
        changeInWorkingCapital: ['Change in Working Capital'],
        accountsReceivables: ['Accounts Receivables'],
        inventory: ['Inventory'],
        accountsPayables: ['Accounts Payables'],
        otherWorkingCapital: ['Other Working Capital'],
        otherNonCashItems: ['Other Non-Cash Items'],
        netCashProvidedByOperatingActivities: ['Net Cash Provided by Operating Activities'],
        investmentsInPropertyPlantAndEquipment: ['Investments in Property Plant and Equipment'],
        acquisitionsNet: ['Acquisitions Net'],
        purchasesOfInvestments: ['Purchases of Investments'],
        salesMaturitiesOfInvestments: ['Sales/Maturities of Investments'],
        otherInvestingActivites: ['Other Investing Activities'],
        netCashUsedForInvestingActivites: ['Net Cash Used for Investing Activities'],
        debtRepayment: ['Debt Repayment'],
        commonStockIssued: ['Common Stock Issued'],
        commonStockRepurchased: ['Common Stock Repurchased'],
        dividendsPaid: ['Dividends Paid'],
        otherFinancingActivites: ['Other Financing Activities'],
        netCashUsedProvidedByFinancingActivities: ['Net Cash Used/Provided by Financing Activities'],
        effectOfForexChangesOnCash: ['Effect of Forex Changes on Cash'],
        netChangeInCash: ['Net Change in Cash'],
        cashAtEndOfPeriod: ['Cash at End of Period'],
        cashAtBeginningOfPeriod: ['Cash at Beginning of Period'],
        operatingCashFlow: ['Operating Cash Flow'],
        capitalExpenditure: ['Capital Expenditure'],
        freeCashFlow: ['Free Cash Flow'],
        link: ['Report Link'],
        finalLink: ['Final Link']
    };

    // 填充行数据
    data.forEach(entry => {
        rows.date.push(entry.date || 'N/A');
        rows.symbol.push(entry.symbol || 'N/A');
        rows.reportedCurrency.push(entry.reportedCurrency || 'N/A');
        rows.cik.push(entry.cik || 'N/A');
        rows.fillingDate.push(entry.fillingDate || 'N/A');
        rows.acceptedDate.push(entry.acceptedDate || 'N/A');
        rows.calendarYear.push(entry.calendarYear || 'N/A');
        rows.period.push(entry.period || 'N/A');
        rows.netIncome.push(formatNumber(entry.netIncome));
        rows.depreciationAndAmortization.push(formatNumber(entry.depreciationAndAmortization));
        rows.deferredIncomeTax.push(formatNumber(entry.deferredIncomeTax));
        rows.stockBasedCompensation.push(formatNumber(entry.stockBasedCompensation));
        rows.changeInWorkingCapital.push(formatNumber(entry.changeInWorkingCapital));
        rows.accountsReceivables.push(formatNumber(entry.accountsReceivables));
        rows.inventory.push(formatNumber(entry.inventory));
        rows.accountsPayables.push(formatNumber(entry.accountsPayables));
        rows.otherWorkingCapital.push(formatNumber(entry.otherWorkingCapital));
        rows.otherNonCashItems.push(formatNumber(entry.otherNonCashItems));
        rows.netCashProvidedByOperatingActivities.push(formatNumber(entry.netCashProvidedByOperatingActivities));
        rows.investmentsInPropertyPlantAndEquipment.push(formatNumber(entry.investmentsInPropertyPlantAndEquipment));
        rows.acquisitionsNet.push(formatNumber(entry.acquisitionsNet));
        rows.purchasesOfInvestments.push(formatNumber(entry.purchasesOfInvestments));
        rows.salesMaturitiesOfInvestments.push(formatNumber(entry.salesMaturitiesOfInvestments));
        rows.otherInvestingActivites.push(formatNumber(entry.otherInvestingActivites));
        rows.netCashUsedForInvestingActivites.push(formatNumber(entry.netCashUsedForInvestingActivites));
        rows.debtRepayment.push(formatNumber(entry.debtRepayment));
        rows.commonStockIssued.push(formatNumber(entry.commonStockIssued));
        rows.commonStockRepurchased.push(formatNumber(entry.commonStockRepurchased));
        rows.dividendsPaid.push(formatNumber(entry.dividendsPaid));
        rows.otherFinancingActivites.push(formatNumber(entry.otherFinancingActivites));
        rows.netCashUsedProvidedByFinancingActivities.push(formatNumber(entry.netCashUsedProvidedByFinancingActivities));
        rows.effectOfForexChangesOnCash.push(formatNumber(entry.effectOfForexChangesOnCash));
        rows.netChangeInCash.push(formatNumber(entry.netChangeInCash));
        rows.cashAtEndOfPeriod.push(formatNumber(entry.cashAtEndOfPeriod));
        rows.cashAtBeginningOfPeriod.push(formatNumber(entry.cashAtBeginningOfPeriod));
        rows.operatingCashFlow.push(formatNumber(entry.operatingCashFlow));
        rows.capitalExpenditure.push(formatNumber(entry.capitalExpenditure));
        rows.freeCashFlow.push(formatNumber(entry.freeCashFlow));
        rows.link.push(`<a href="${entry.link}" target="_blank">View Report</a>`);
        rows.finalLink.push(`<a href="${entry.finalLink}" target="_blank">Final Report</a>`);
    });

    // 构建 HTML 表格
    let htmlContent = '<table border="1" style="width: 100%; border-collapse: collapse;">';
    Object.keys(rows).forEach(key => {
        htmlContent += `<tr><th>${rows[key][0]}</th>`;
        rows[key].slice(1).forEach(value => {
            htmlContent += `<td>${value}</td>`;
        });
        htmlContent += '</tr>';
    });
    htmlContent += '</table>';

    container.innerHTML = htmlContent;
    const expandButton = document.getElementById('expandButton_Cashflow');
    if (expandButton) expandButton.style.display = 'inline'; // 显示 Read More 按钮
}

function fetchData_Cashflow(apiUrl, callback, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '<p>Loading...</p>';
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // 檢查回應資料是否為 undefined 或非陣列
            if (data === undefined || !Array.isArray(data)) {
                container.innerHTML = '<p>Error loading data: Data is not an array or is undefined.</p>';
            } else {
                if (data.length > 0) {
                    callback(data, container);  // 修改這裡以傳遞整個數據陣列
                } else {
                    container.innerHTML = '<p>No data found for this symbol.</p>';
                }
            }
        })
        .catch(error => {
            console.error('Error fetching data: ', error);
            container.innerHTML = '<p>Error loading data. Please check the console for more details.</p>';
        });
}

function formatNumber(value) {
    // Check if the value is numeric and format it, otherwise return 'N/A'
    return value != null && !isNaN(value) ? parseFloat(value).toLocaleString('en-US') : 'N/A';
}



//////////////法說會逐字稿 Earnings Call Transcript/////////////////
function fetchEarningsCallTranscript() {
    var stockSymbol = fetchStock();
    const year = document.getElementById('yearInput').value;
    const quarter = document.getElementById('quarterInput').value;
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (stockSymbol.length === 0 || year.length === 0 || quarter.length === 0) {
        alert('請輸入股票代碼、年份及季度。');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/earning_call_transcript/${stockSymbol}?year=${year}&quarter=${quarter}&apikey=${apiKey}`;
    fetchData_Transcript(apiUrl, displayEarningsCallTranscript, 'earningsCallTranscriptContainer');
}

function displayEarningsCallTranscript(transcript, container) {
    if (!transcript || !transcript.content) {
        container.innerHTML = '<p>資料不可用。</p>';
        return;
    }

    let htmlContent = `<p id="transcriptPreview">${transcript.content.slice(0, 1000)}...</p>`;
    htmlContent += `<p id="fullTranscript" style="display:none; white-space: normal;">${transcript.content}</p>`;
    htmlContent += '<button id="expandButton" onclick="expandTranscript(event)">顯示較多</button>';
    htmlContent += '<button id="collapseButton" style="display: none;" onclick="collapseTranscript(event)">顯示較少</button>';
    container.innerHTML = htmlContent;
}

function expandTranscript(event) {
    event.stopPropagation(); // 防止觸發區塊固定功能
    const section = event.target.closest('.section');
    section.classList.add('fixed'); // 固定区块展开
    section.querySelector('.content').style.maxHeight = 'none'; // 取消 maxHeight 限制
    section.querySelector('.content').style.height = 'auto'; // 确保内容高度自适应
    section.querySelector('.content').style.overflow = 'visible'; // 显示所有内容
    document.getElementById('transcriptPreview').style.display = 'none';
    document.getElementById('fullTranscript').style.display = 'block';
    document.getElementById('expandButton').style.display = 'none';
    document.getElementById('collapseButton').style.display = 'inline';
}

function collapseTranscript(event) {
    event.stopPropagation(); // 防止觸發區塊固定功能
    const section = event.target.closest('.section');
    section.classList.remove('fixed'); // 取消区块固定
    section.querySelector('.content').style.maxHeight = ''; // 恢复 maxHeight 限制
    section.querySelector('.content').style.height = ''; // 恢复默认高度
    section.querySelector('.content').style.overflow = ''; // 恢复默认溢出行为
    document.getElementById('transcriptPreview').style.display = 'block';
    document.getElementById('fullTranscript').style.display = 'none';
    document.getElementById('expandButton').style.display = 'inline';
    document.getElementById('collapseButton').style.display = 'none';
}

function fetchData_Transcript(apiUrl, callback, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '<p>正在加載數據...</p>';
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                callback(data[0], container);
            } else {
                container.innerHTML = '<p>無相關數據。</p>';
            }
        })
        .catch(error => {
            console.error('數據加載錯誤: ', error);
            container.innerHTML = '<p>數據加載錯誤。請檢查控制台了解更多詳情。</p>';
        });
}

//////////////法說會日曆 Earnings Call Calendar/////////////////


function fetchEarningsCallCalendar() {
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;
    stockSymbol = fetchStock();
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';
    if (!fromDate || !toDate) {
        alert('Please enter both from and to dates.');
        return;
    }
    const apiUrl = `https://financialmodelingprep.com/api/v3/earning_calendar?from=${fromDate}&to=${toDate}&apikey=${apiKey}`;
    fetchData_2(apiUrl, (data) => displayEarningsCallCalendar(data, 'earningsCallCalendarContainer', stockSymbol), 'earningsCallCalendarContainer');
}

function displayEarningsCallCalendar(data, containerId, stockSymbol) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Container element not found');
        return;
    }

    if (!data || !Array.isArray(data)) {
        container.innerHTML = '<p>Error loading data: Data is not an array or is undefined.</p>';
        return;
    }

    const earningsData = stockSymbol ? data.filter(item => item.symbol.toUpperCase() === stockSymbol) : data;
    if (earningsData.length === 0) {
        container.innerHTML = `<p>No earnings calendar data found for ${stockSymbol}.</p>`;
        return;
    }

    let htmlContent = '<ul>';
    earningsData.forEach(item => {
        htmlContent += `<li>
            Date: ${item.date || 'N/A'} <br>
            Symbol: ${item.symbol || 'N/A'} <br>
            EPS: ${item.eps !== null ? item.eps.toFixed(4) : 'N/A'} <br>
            EPS Estimated: ${item.epsEstimated !== null ? item.epsEstimated.toFixed(4) : 'N/A'} <br>
            Revenue: ${item.revenue !== null ? item.revenue.toLocaleString() : 'N/A'} <br>
            Revenue Estimated: ${item.revenueEstimated !== null ? item.revenueEstimated.toLocaleString() : 'N/A'}
        </li>`;
    });
    htmlContent += '</ul>';
    container.innerHTML = htmlContent;
}

function fetchData_2(apiUrl, callback, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '<p>Loading...</p>';
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            console.log('Data received:', data); // 查看原始返回數據
            // 確保 data 是一個陣列
            if (Array.isArray(data)) {
                if (data.length > 0) {
                    callback(data, container);
                } else {
                    container.innerHTML = '<p>No data found for this symbol.</p>';
                }
            } else if (data !== undefined) {
                // 如果 data 不是陣列,也不是 undefined,則視為錯誤
                throw new Error('Data is not an array');
            } else {
                // 如果 data 是 undefined,顯示錯誤訊息
                container.innerHTML = '<p>Error loading data: Data is not an array or is undefined.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching data: ', error);
            container.innerHTML = `<p>Error loading data: ${error.message}. Please check the console for more details.</p>`;
        });
}
//////////////歷史獲利和未來獲利 Historical and Future Earnings/////////////////

function fetch_historical_earning_calendar() {
    stockSymbol = fetchStock();
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf'; // 你的 API 密鑰
    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/historical/earning_calendar/${stockSymbol}?apikey=${apiKey}`;
    fetchData_historical_earning_calendar(apiUrl, display_historical_earning_calendar, 'historicalEarningsContainer');
}

function display_historical_earning_calendar(data, container) {
    const fromDate = document.getElementById('fromDate_1').value;
    const toDate = document.getElementById('toDate_1').value;
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);

    if (!data || data.length === 0) {
        container.innerHTML = '<p>No data available.</p>';
        return;
    }

    let rows = {
        date: ['Date'],
        symbol: ['Symbol'],
        eps: ['EPS'],
        estimatedEPS: ['Estimated EPS'],
        epsDifference: ['EPS預期差異'], // 新增列标题
        time: ['Time'],
        revenue: ['Revenue'],
        estimatedRevenue: ['Estimated Revenue'],
        revenueDifference: ['營收預期差異'], // 新增列标题
        fiscalDateEnding: ['Fiscal Date Ending']
    };

    data.forEach(item => {
        const itemDate = new Date(item.date);
        if (itemDate >= startDate && itemDate <= endDate) {
            rows.date.push(item.date || 'N/A');
            rows.symbol.push(item.symbol || 'N/A');
            rows.eps.push(item.eps != null ? item.eps : 'N/A');
            rows.estimatedEPS.push(item.epsEstimated != null ? item.epsEstimated : 'N/A');
            // 计算 EPS 预期差异百分比
            if (item.eps != null && item.epsEstimated != null && item.epsEstimated !== 0) {
                const epsDifference = ((item.eps - item.epsEstimated) / item.epsEstimated * 100).toFixed(2) + '%';
                rows.epsDifference.push(epsDifference);
            } else {
                rows.epsDifference.push('N/A');
            }
            rows.time.push(item.time || 'N/A');
            rows.revenue.push(item.revenue != null ? item.revenue.toLocaleString() : 'N/A');
            rows.estimatedRevenue.push(item.revenueEstimated != null ? item.revenueEstimated.toLocaleString() : 'N/A');
            // 计算营收预期差异百分比
            if (item.revenue != null && item.revenueEstimated != null && item.revenueEstimated !== 0) {
                const revenueDifference = ((item.revenue - item.revenueEstimated) / item.revenueEstimated * 100).toFixed(2) + '%';
                rows.revenueDifference.push(revenueDifference);
            } else {
                rows.revenueDifference.push('N/A');
            }
            rows.fiscalDateEnding.push(item.fiscalDateEnding || 'N/A');
        }
    });

    let htmlContent = '<table border="1">';
    Object.keys(rows).forEach(key => {
        htmlContent += `<tr><th>${rows[key][0]}</th>`;
        rows[key].slice(1).forEach(value => {
            htmlContent += `<td>${value}</td>`;
        });
        htmlContent += '</tr>';
    });
    htmlContent += '</table>';
    container.innerHTML = htmlContent;
}

function fetchData_historical_earning_calendar(apiUrl, callback, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '<p>Loading...</p>';
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                container.innerHTML = '<p>Error loading data: ' + data.error + '</p>';
                return;
            }
            callback(data, container);
        })
        .catch(error => {
            console.error('Error fetching data: ', error);
            container.innerHTML = '<p>Error loading data. Please check the console for more details.</p>';
        });
}

//////////////股利發放日期/////////////////
function fetch_stock_dividend_calendar() {
    const fromDate = document.getElementById('fromDate_2').value;
    const toDate = document.getElementById('toDate_2').value;
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf'; // 请替换成您的 API 密钥

    if (!fromDate || !toDate) {
        alert('Please enter both a start and an end date.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/stock_dividend_calendar?from=${fromDate}&to=${toDate}&apikey=${apiKey}`;
    fetchData(apiUrl, display_stock_dividend_calendar, 'stockDividendCalendarContainer');
}

function display_stock_dividend_calendar(data, container) {
    stockSymbol = fetchStock();
    if (!data || data.length === 0) {
        container.innerHTML = '<p>No data available for the selected dates.</p>';
        return;
    }

    let htmlContent = '<table border="1">';
    htmlContent += `
            <tr>
                <th>Date</th>
                <th>Label</th>
                <th>Symbol</th>
                <th>Dividend</th>
                <th>Adjusted Dividend</th>
                <th>Declaration Date</th>
                <th>Record Date</th>
                <th>Payment Date</th>
            </tr>
        `;

    // 过滤并只显示匹配的股票代码
    data.forEach(item => {
        if (item.symbol.toUpperCase() === stockSymbol.toUpperCase()) { // 只添加符合输入的股票代码的行
            htmlContent += `
                    <tr>
                        <td>${item.date || 'N/A'}</td>
                        <td>${item.label || 'N/A'}</td>
                        <td>${item.symbol || 'N/A'}</td>
                        <td>${item.dividend != null ? item.dividend : 'N/A'}</td>
                        <td>${item.adjDividend != null ? item.adjDividend : 'N/A'}</td>
                        <td>${item.declarationDate || 'N/A'}</td>
                        <td>${item.recordDate || 'N/A'}</td>
                        <td>${item.paymentDate || 'N/A'}</td>
                    </tr>
                `;
        }
    });

    htmlContent += '</table>';
    container.innerHTML = htmlContent;

    if (htmlContent.indexOf('<tr>') === -1) { // 如果没有匹配的数据，显示消息
        container.innerHTML = '<p>No data available for the selected stock symbol.</p>';
    }
}

function fetchData(apiUrl, callback, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '<p>Loading...</p>'; // 提供加载时的临时内容
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (!data || data.length === 0) {
                container.innerHTML = '<p>No data available.</p>';
                return;
            }
            callback(data, container);
        })
        .catch(error => {
            console.error('Error fetching data: ', error);
            container.innerHTML = '<p>Error loading data. Please check the console for more details.</p>';
        });
}

//////////////內部人交易/////////////////
function fetchInsiderTrades() {
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf'; // 替換為你的 API 密鑰
    stockSymbol = fetchStock();
    const apiUrl = `https://financialmodelingprep.com/api/v4/insider-trading?symbol=${stockSymbol}&page=0&apikey=${apiKey}`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const container = document.getElementById('insiderTradesContainer');
            displayInsiderTrades(data, container);
        })
        .catch(error => {
            console.error('Error fetching data: ', error);
            const container = document.getElementById('insiderTradesContainer');
            container.innerHTML = '<tr><td colspan="11">Error loading data. Please check the console for more details.</td></tr>';
        });
}

function displayInsiderTrades(data, container) {
    if (!data || !Array.isArray(data) || data.length === 0) {
        container.innerHTML = '<p>No data available.</p>';
        return;
    }

    let rows = {
        symbol: ['Symbol'],
        filingDate: ['Filing Date'],
        transactionDate: ['Transaction Date'],
        reportingName: ['Reporting Name'],
        transactionType: ['Transaction Type'],
        securitiesOwned: ['Securities Owned'],
        securitiesTransacted: ['Securities Transacted'],
        securityName: ['Security Name'],
        price: ['Price'],
        formType: ['Form Type'],
        link: ['Link']
    };

    // 填充行数据
    data.forEach(item => {
        rows.symbol.push(item.symbol || 'N/A');
        rows.filingDate.push(item.filingDate || 'N/A');
        rows.transactionDate.push(item.transactionDate || 'N/A');
        rows.reportingName.push(item.reportingName || 'N/A');
        rows.transactionType.push(item.transactionType || 'N/A');
        rows.securitiesOwned.push(item.securitiesOwned ? item.securitiesOwned.toLocaleString() : 'N/A');
        rows.securitiesTransacted.push(item.securitiesTransacted ? item.securitiesTransacted.toLocaleString() : 'N/A');
        rows.securityName.push(item.securityName || 'N/A');
        rows.price.push(item.price ? `$${item.price.toFixed(2)}` : 'N/A');
        rows.formType.push(item.formType || 'N/A');
        rows.link.push(item.link ? `<a href="${item.link}" target="_blank">View Form</a>` : 'N/A');
    });

    // 构建 HTML 表格
    let htmlContent = '<table border="1" style="width: 100%; border-collapse: collapse;">';
    Object.keys(rows).forEach(key => {
        htmlContent += `<tr><th>${rows[key][0]}</th>`;
        rows[key].slice(1).forEach(value => {
            htmlContent += `<td>${value}</td>`;
        });
        htmlContent += '</tr>';
    });
    htmlContent += '</table>';

    container.innerHTML = htmlContent;
}


////////////////////////////錄音檔轉文字/////////////////////////////
let originalFileNames = {};
let currentOriginalFileName = '';
let pollingInterval;
const baseUrl = 'https://api.poseidonllp.com';

document.addEventListener("DOMContentLoaded", () => {
    fetchFileList();
    fetchTextFileList();
    updateQueueLength();
    setInterval(updateQueueLength, 500); // 每5秒更新一次排程長度
});

function fetchFileList(newFileName = null) {
    console.log("從伺服器獲取文件列表...");
    fetch(`${baseUrl}/list_files`, {
        method: 'GET',
        mode: 'cors', // 確保有設置此選項
        credentials: 'include'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('網絡響應不正常 ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log("文件列表成功獲取:", data);
            const select = document.getElementById('ftpFileSelect');
            if (!select) {
                console.error('找不到 ID 為 "ftpFileSelect" 的元素');
                return;
            }
            select.innerHTML = '';  // 清空之前的選項

            if (data.files && data.files.length > 0) {
                // 將文件按最新時間排序
                const sortedFiles = data.files.sort((a, b) => {
                    const dateA = extractDate(a.original);
                    const dateB = extractDate(b.original);
                    return dateB - dateA;
                });

                sortedFiles.forEach(fileInfo => {
                    const encodedFileName = fileInfo.encoded;
                    const originalFileName = decodeURIComponent(fileInfo.original);
                    originalFileNames[encodedFileName] = originalFileName;
                    const option = document.createElement('option');
                    option.value = encodedFileName;
                    option.textContent = originalFileName;
                    select.appendChild(option);
                });

                if (newFileName) {
                    const newFileOption = Array.from(select.options).find(option => option.textContent === newFileName);
                    if (newFileOption) {
                        select.value = newFileOption.value;
                        select.insertBefore(newFileOption, select.firstChild);
                    }
                } else {
                    select.selectedIndex = 0;
                }
            } else {
                const option = document.createElement('option');
                option.textContent = "無可用文件";
                option.disabled = true;
                select.appendChild(option);
            }
        })
        .catch(error => {
            console.error('獲取文件列表時出錯:', error);
            const uploadResult = document.getElementById('upload-result');
            if (uploadResult) {
                uploadResult.innerText = '錯誤發生，請檢查網絡連接或伺服器狀態！\n' + error;
            }
        });
}

function extractDate(fileName) {
    const datePattern = /\d{8}/;
    const match = fileName.match(datePattern);
    if (match) {
        const dateString = match[0];
        return new Date(
            parseInt(dateString.substring(0, 4), 10),
            parseInt(dateString.substring(4, 6), 10) - 1,
            parseInt(dateString.substring(6, 8), 10)
        );
    }
    return new Date(0);
}

function fetchTextFileList(newTextFileName = null) {
    console.log("從伺服器獲取文字文件列表...");
    fetch(`${baseUrl}/list_text_files`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('網絡響應不正常 ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log("文字文件列表成功獲取:", data);
            const select = document.getElementById('textFileSelect');
            if (!select) {
                console.error('找不到 ID 為 "textFileSelect" 的元素');
                return;
            }
            select.innerHTML = '';  // 清空之前的選項
            if (data.files && data.files.length > 0) {
                data.files.forEach(fileName => {
                    const decodedFileName = decodeURIComponent(fileName);
                    const option = document.createElement('option');
                    option.value = fileName;
                    option.textContent = decodedFileName;
                    select.appendChild(option);
                });

                if (newTextFileName) {
                    const newTextFileOption = Array.from(select.options).find(option => option.textContent === newTextFileName);
                    if (newTextFileOption) {
                        select.value = newTextFileOption.value;
                        select.insertBefore(newTextFileOption, select.firstChild);
                    }
                } else {
                    select.selectedIndex = 0;
                }
            } else {
                const option = document.createElement('option');
                option.textContent = "無可用文件";
                option.disabled = true;
                select.appendChild(option);
            }
        })
        .catch(error => {
            console.error('獲取文字文件列表時出錯:', error);
            const uploadResult = document.getElementById('upload-result');
            if (uploadResult) {
                uploadResult.innerText = '錯誤發生，請檢查網絡連接或伺服器狀態！\n' + error;
            }
        });
}

function showAlert(message) {
    const alertBox = document.createElement('div');
    alertBox.className = 'alert';
    alertBox.innerHTML = `${message}<span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>`;
    document.body.appendChild(alertBox);

    setTimeout(() => {
        alertBox.style.display = 'none';
    }, 5000);
}

function uploadToFTP() {
    const fileInput = document.getElementById('audioFile');
    const file = fileInput.files[0];

    if (!file) {
        showAlert('請選擇一個檔案！');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('originalFileName', file.name);

    const uploadProgressContainer = document.getElementById('upload-progress-container');
    const uploadProgressBar = document.getElementById('upload-progress-bar');
    const uploadProgressText = document.getElementById('upload-progress-text');

    uploadProgressContainer.style.display = 'block';
    uploadProgressText.style.display = 'block';

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${baseUrl}/upload_to_ftp`, true);

    xhr.upload.onprogress = function (event) {
        if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            uploadProgressBar.style.width = `${percentComplete}%`;
            uploadProgressText.textContent = `檔案上傳中... ${Math.round(percentComplete)}%`;
        }
    };

    xhr.onload = function () {
        uploadProgressContainer.style.display = 'none';
        uploadProgressText.style.display = 'none';
        if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            showAlert(response.message || '檔案已成功上傳到伺服器');
            const newFileName = file.name;
            fetchFileList(newFileName);
            fileInput.value = '';
        } else if (xhr.status === 503) {
            showAlert('另一個轉檔過程正在進行中，請稍後再試');
        } else {
            const response = JSON.parse(xhr.responseText);
            showAlert('上傳失敗，請重試！' + (response.error ? '<br>' + response.error : ''));
        }
    };

    xhr.onerror = function () {
        uploadProgressContainer.style.display = 'none';
        uploadProgressText.style.display = 'none';
        showAlert('上傳失敗，請重試！');
    };

    xhr.send(formData);
}

function transcribeFromFTP() {
    const select = document.getElementById('ftpFileSelect');
    const encodedFilename = select.value;
    currentOriginalFileName = originalFileNames[encodedFilename];

    if (!encodedFilename) {
        showAlert('請選擇FTP上的檔案！');
        return;
    }

    clearPreviousResult();
    document.getElementById('transcription-progress-container').style.display = 'block';
    document.getElementById('transcription-status').textContent = '正在提交轉錄請求...';

    fetch(`${baseUrl}/transcribe_from_ftp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filename: encodedFilename })
    })
        .then(response => {
            if (response.status === 202) {
                // showAlert('轉檔已加入排程，請稍後...');
                document.getElementById('transcription-status').textContent = '轉檔已進入排程，請稍後...';
                startPolling(encodedFilename);
                return { message: '已加入排程隊列' };
            } else if (response.status === 503) {
                showAlert('服務器忙碌中，請稍後重試');
            } else if (!response.ok) {
                throw new Error('服務器錯誤，請稍後重試');
            }
            return response.json();
        })
        .then(data => {
            if (data.message === '已加入排程隊列') {
                showAlert(data.message);
                document.getElementById('transcription-status').textContent = '轉檔已進入排程，請稍後...';
                startPolling(encodedFilename);
            } else if (data.text) {
                displayTranscription(data);
                showAlert('轉錄完成');
            } else {
                throw new Error('未收到預期的響應數據');
            }
        })
        .catch(error => {
            document.getElementById('transcription-progress-container').style.display = 'none';
            console.error('轉錄錯誤:', error);
            showAlert(error.message || '轉錄過程中發生錯誤，請重試！');
        });
}

function startPolling(filename) {
    const statusElement = document.getElementById('transcription-status');
    statusElement.textContent = '任務排隊中，請稍候...';

    if (pollingInterval) {
        clearInterval(pollingInterval);
    }

    pollingInterval = setInterval(() => {
        fetch(`${baseUrl}/check_transcription_status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ filename: filename })
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'completed') {
                    clearInterval(pollingInterval);
                    fetchTranscriptionResult(filename);
                    statusElement.textContent = '轉錄完成';
                    showAlert('轉錄完成');
                } else if (data.status === 'in_progress') {
                    statusElement.textContent = `轉錄進行中... ${data.progress || ''}`;
                } else if (data.status === 'queued') {
                    statusElement.textContent = '任務仍在隊列中，請稍候...';
                }
            })
            .catch(error => {
                clearInterval(pollingInterval);
                console.error('檢查狀態時出錯:', error);
                showAlert('檢查轉錄狀態時出錯，請稍後手動檢查結果');
                statusElement.textContent = '狀態檢查失敗';
            });
    }, 5000); // 每5秒检查一次
}

function fetchTranscriptionResult(filename) {
    fetch(`${baseUrl}/get_transcription_result`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filename: filename })
    })
        .then(response => response.json())
        .then(data => {
            if (data.text) {
                displayTranscription(data);
                showAlert('轉錄完成');
            } else {
                showAlert('無法獲取轉錄結果');
            }
        })
        .catch(error => {
            console.error('獲取轉錄結果時出錯:', error);
            showAlert('獲取轉錄結果時出錯，請稍後重試');
        });
}

function clearPreviousResult() {
    const container = document.getElementById('transcriptionResult');
    container.innerHTML = '';

    document.getElementById('readMoreBtn').classList.add('hidden');
    document.getElementById('readLessBtn').classList.add('hidden');
    container.style.maxHeight = '200px';
}

function displayTranscription(data) {
    const container = document.getElementById('transcriptionResult');
    const readMoreBtn = document.getElementById('readMoreBtn');
    const readLessBtn = document.getElementById('readLessBtn');

    container.innerHTML = '';

    if (data.text) {
        const transcriptionText = data.text.replace(/\n/g, '<br>');
        container.innerHTML = `<p>${transcriptionText}</p>`;

        if (container.scrollHeight > container.clientHeight) {
            readMoreBtn.classList.remove('hidden');
        } else {
            readMoreBtn.classList.add('hidden');
        }
        readLessBtn.classList.add('hidden');
    } else {
        container.innerHTML = '<p>無轉寫內容</p>';
        readMoreBtn.classList.add('hidden');
        readLessBtn.classList.add('hidden');
    }

    document.getElementById('transcription-progress-container').style.display = 'none';
    showAlert('轉錄完成');
}


function toggleReadMore() {
    const container = document.getElementById('transcriptionResult');
    const readMoreBtn = document.getElementById('readMoreBtn');
    const readLessBtn = document.getElementById('readLessBtn');
    if (readMoreBtn.classList.contains('hidden')) {
        container.style.maxHeight = '200px';
        readMoreBtn.classList.remove('hidden');
        readLessBtn.classList.add('hidden');
    } else {
        container.style.maxHeight = 'none';
        readMoreBtn.classList.add('hidden');
        readLessBtn.classList.remove('hidden');
    }
}

function downloadTextFile() {
    const select = document.getElementById('textFileSelect');
    const textFileName = select.value;
    if (!textFileName) {
        alert('請選擇一個文字檔案！');
        return;
    }
    const encodedFileName = encodeURIComponent(textFileName);

    const downloadUrl = `${baseUrl}/download_text_file/${encodedFileName}`;

    console.log("開始下載文件：", downloadUrl);

    fetch(downloadUrl, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('網絡響應不正常：' + response.statusText);
            }
            return response.blob();
        })
        .then(blob => {
            console.log("文件下載成功，處理 Blob 數據...");
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = textFileName;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        })
        .catch(error => {
            console.error('下載文件時出錯：', error);
            alert('下載失敗，請檢查網絡連接或伺服器狀態！\n' + error);
        });
}

function updateQueueLength() {
    fetch(`${baseUrl}/queue_length`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('網絡響應不正常 ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const queueLengthElement = document.getElementById('queueLength');
            queueLengthElement.innerText = data.queueLength;
        })
        .catch(error => {
            console.error('獲取排程長度時出錯:', error);
        });
}