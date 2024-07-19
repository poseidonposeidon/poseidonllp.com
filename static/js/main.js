///////////////////////////////////////////////////////////////////////////
let activeSection = null;

document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/';  // 重定向到登录页面
    } else {
        // 验证 token
        fetch('https://api.poseidonllp.com/api/verify-token', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Invalid token');
                }
                return response.json();
            })
            .then(data => {
                // Token 有效，显示页面内容
                document.body.style.display = 'block';
            })
            .catch(error => {
                // Token 无效，重定向到登录页面
                localStorage.removeItem('authToken');
                window.location.href = '/';
            });
    }
});

document.getElementById('stockSymbol').addEventListener('input', function(e) {
    e.target.value = e.target.value.toUpperCase();
});

document.getElementById("stockSymbol").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevent form submission
        document.querySelector(".info-input button").click(); // Trigger button click event
    }
});

function fetchStock() {
    const stockSymbol = document.getElementById('stockSymbol').value.trim().toUpperCase();
    const previousSymbol = document.getElementById('outputSymbol').getAttribute('data-last-symbol');

    if (stockSymbol !== previousSymbol) {
        document.getElementById('outputSymbol').innerText = 'Current query: ' + stockSymbol;
        document.getElementById('outputSymbol').setAttribute('data-last-symbol', stockSymbol);

        // Clear previous company data
        const companyProfileContainer = document.getElementById('companyProfileContainer');
        if (companyProfileContainer) {
            companyProfileContainer.innerHTML = '';
        }

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

    fetchCompanyProfile(stockSymbol);  // Pass stockSymbol to fetchCompanyProfile
    return stockSymbol;
}

function fetchStockJP() {
    let stockSymbol = document.getElementById('stockSymbolJP').value.trim();
    const previousSymbol = document.getElementById('outputSymbolJP').getAttribute('data-last-symbol');

    // 確認日股代號格式是否正確，例如 "7203"
    const jpStockPattern = /^[0-9]{4}$/;
    if (!jpStockPattern.test(stockSymbol)) {
        alert('Please enter a valid J.P Stock symbol (e.g., 7203)');
        return;
    }

    // 自動添加 ".T"
    stockSymbol = stockSymbol.toUpperCase() + '.T';

    if (stockSymbol !== previousSymbol) {
        document.getElementById('outputSymbolJP').innerText = 'Current query: ' + stockSymbol;
        document.getElementById('outputSymbolJP').setAttribute('data-last-symbol', stockSymbol);

        // 清空先前的公司資料
        const companyProfileContainerJP = document.getElementById('companyProfileContainerJP');
        if (companyProfileContainerJP) {
            companyProfileContainerJP.innerHTML = '';
        }

        const containers = [
            'incomeStatementContainerJP',
            'balanceSheetContainerJP',
            'cashflowContainerJP',
            'earningsCallTranscriptContainerJP',
            'earningsCallCalendarContainerJP',
            'historicalEarningsContainerJP',
            'stockDividendCalendarContainerJP',
            'insiderTradesContainerJP'
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

    // 這裡直接調用 fetchIncomeStatement，並傳遞修改後的 stockSymbol
    fetchIncomeStatement(stockSymbol, 'jp');
    return stockSymbol;
}

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

function toggleSection(event, sectionId) {
    event.preventDefault();
    const section = document.querySelector(sectionId);
    const overlay = document.querySelector('.overlay');
    const blurElements = document.querySelectorAll('body > *:not(.overlay):not(.navbar):not(.info-section):not(.ai-box-section)');

    if (activeSection && activeSection === section) {
        hideSection(section);
        activeSection = null;
        overlay.classList.remove('active');
        document.body.classList.remove('modal-open');
        blurElements.forEach(el => el.classList.remove('blur-background'));
    } else {
        if (activeSection) {
            hideSection(activeSection);
        }
        showSection(section);
        activeSection = section;
        overlay.classList.add('active');
        document.body.classList.add('modal-open');
        blurElements.forEach(el => el.classList.add('blur-background'));
    }
}

function showSection(section) {
    section.style.display = 'block';
    setTimeout(() => {
        section.classList.add('active');
        section.style.overflowY = 'auto'; // 確保展開後支援滾動
    }, 10);
}

function hideSection(section) {
    section.classList.remove('active');
    section.style.overflowY = 'hidden'; // 隱藏時移除滾動條
    setTimeout(() => {
        if (!section.classList.contains('active')) {
            section.style.display = 'none';
        }
    }, 500); // Match CSS transition duration
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#info-section, #info-section-jp, #ai_box').forEach(section => {
        section.style.display = 'none';
    });
});

function loadSection(sectionId) {
    const sections = {
        'income-statement': `
            <div class="section" id="income-statement" onmouseover="expandSection(this)" onmouseleave="collapseSection(this)" onclick="toggleFixed(event, this)">
                <h2>Income Statement</h2>
                <div class="content scroll-container-x">
                    <label for="period">Select Period:</label>
                    <select id="period">
                        <option value="annual">Annual</option>
                        <option value="quarter">Quarter</option>
                    </select>
                    <button onclick="fetchIncomeStatement()">Load Statement</button>
                    <div class="scroll-container-x">
                        <table id="IncomeStatementTable" border="1">
                            <div id="incomeStatementContainer"></div>
                        </table>
                    </div>
                </div>
            </div>`,
        'balance-sheet': `
            <div class="section" id="balance-sheet" onmouseover="expandSection(this)" onmouseleave="collapseSection(this)" onclick="toggleFixed(event, this)">
                <h2>Balance Sheet Statements</h2>
                <div class="content scroll-container-x">
                    <label for="period_2">Select Period:</label>
                    <select id="period_2">
                        <option value="annual">Annual</option>
                        <option value="quarter">Quarter</option>
                    </select>
                    <button onclick="fetchBalanceSheet()">Load Statement</button>
                    <div id="balanceSheetContainer"></div>
                </div>
            </div>`,
        'cashflow-statement': `
            <div class="section" id="cashflow-statement" onmouseover="expandSection(this)" onmouseleave="collapseSection(this)" onclick="toggleFixed(event, this)">
                <h2>Cashflow Sheet Statements</h2>
                <div class="content scroll-container-x">
                    <label for="period_3">Select Period:</label>
                    <select id="period_3">
                        <option value="annual">Annual</option>
                        <option value="quarter">Quarter</option>
                    </select>
                    <button onclick="fetchCashflow()">Load Statement</button>
                    <div class="scroll-container-x">
                        <table id="cashflowTable" border="1">
                            <div id="cashflowContainer"></div>
                        </table>
                    </div>
                </div>
            </div>`,
        'earnings-call-transcript': `
            <div class="section" id="earnings-call-transcript" onmouseover="expandSection(this)" onmouseleave="collapseSection(this)" onclick="toggleFixed(event, this)">
                <h2>Earnings Call Transcript</h2>
                <div class="content">
                    <input type="number" id="yearInput" placeholder="Enter Year">
                    <input type="number" id="quarterInput" placeholder="Enter Quarter">
                    <button onclick="fetchEarningsCallTranscript()">Load Transcript</button>
                    <div class="scroll-container-y scroll-container-x" id="earningsCallTranscriptContainer">
                        <!-- Transcription content will be displayed here -->
                    </div>
                </div>
            </div>`,
        'earnings-call-calendar': `
            <div class="section" id="earnings-call-calendar" onmouseover="expandSection(this)" onmouseleave="collapseSection(this)" onclick="toggleFixed(event, this)">
                <h2>Earnings Call Calendar</h2>
                <div class="content">
                    <input type="date" id="fromDate" placeholder="From Date">
                    <input type="date" id="toDate" placeholder="To Date">
                    <button onclick="fetchEarningsCallCalendar()">Load Calendar</button>
                    <div class="scroll-container">
                        <div id="earningsCallCalendarContainer"></div>
                    </div>
                </div>
            </div>`,
        'historical-earnings': `
            <div class="section" id="historical-earnings" onmouseover="expandSection(this)" onmouseleave="collapseSection(this)" onclick="toggleFixed(event, this)">
                <h2>Historical and Future Earnings</h2>
                <div class="content">
                    <input type="date" id="fromDate_1" placeholder="From Date">
                    <input type="date" id="toDate_1" placeholder="To Date">
                    <button onclick="fetch_historical_earning_calendar()">Load Calendar</button>
                    <div class="scroll-container" id="historicalEarningsContainer">
                        <!-- Data table will be displayed here -->
                    </div>
                </div>
            </div>`,
        'dividend-calendar': `
            <div class="section" id="dividend-calendar" onmouseover="expandSection(this)" onmouseleave="collapseSection(this)" onclick="toggleFixed(event, this)">
                <h2>Dividend Calendar</h2>
                <div class="content">
                    <input type="date" id="fromDate_2" placeholder="From Date">
                    <input type="date" id="toDate_2" placeholder="To Date">
                    <button onclick="fetch_stock_dividend_calendar()">Load Calendar</button>
                    <div class="scroll-container" id="stockDividendCalendarContainer">
                        <!-- Data table will be displayed here -->
                    </div>
                </div>
            </div>`,
        'insider-trades': `
            <div class="section" id="insider-trades" onmouseover="expandSection(this)" onmouseleave="collapseSection(this)" onclick="toggleFixed(event, this)">
                <h2>Insider Trades</h2>
                <div class="content">
                    <button onclick="fetchInsiderTrades()">Load Table</button>
                    <div class="scroll-container-x" id="insiderTradesContainer">
                        <!-- Data table will be displayed here -->
                    </div>
                </div>
            </div>`
    };

    const sectionContainer = document.getElementById('section-container');
    sectionContainer.innerHTML = sections[sectionId] || '<p>Section not found</p>';
}

function loadSectionJP(sectionId) {
    const sections = {
        'income-statement-jp': `
            <div class="section" id="income-statement-jp" onmouseover="expandSection(this)" onmouseleave="collapseSection(this)" onclick="toggleFixed(event, this)">
                <h2>Income Statement</h2>
                <div class="content scroll-container-x">
                    <label for="period-jp">Select Period:</label>
                    <select id="period-jp">
                        <option value="annual">Annual</option>
                        <option value="quarter">Quarter</option>
                    </select>
                    <button onclick="fetchIncomeStatement()">Load Statement</button>
                    <div class="scroll-container-x">
                        <table id="IncomeStatementTableJP" border="1">
                            <div id="incomeStatementContainerJP"></div>
                        </table>
                    </div>
                </div>
            </div>`,
        'balance-sheet-jp': `
            <div class="section" id="balance-sheet-jp" onmouseover="expandSection(this)" onmouseleave="collapseSection(this)" onclick="toggleFixed(event, this)">
                <h2>Balance Sheet Statements</h2>
                <div class="content scroll-container-x">
                    <label for="period_2-jp">Select Period:</label>
                    <select id="period_2-jp">
                        <option value="annual">Annual</option>
                        <option value="quarter">Quarter</option>
                    </select>
                    <button onclick="fetchBalanceSheetJP()">Load Statement</button>
                    <div id="balanceSheetContainerJP"></div>
                </div>
            </div>`,
        'cashflow-statement-jp': `
            <div class="section" id="cashflow-statement-jp" onmouseover="expandSection(this)" onmouseleave="collapseSection(this)" onclick="toggleFixed(event, this)">
                <h2>Cashflow Sheet Statements</h2>
                <div class="content scroll-container-x">
                    <label for="period_3-jp">Select Period:</label>
                    <select id="period_3-jp">
                        <option value="annual">Annual</option>
                        <option value="quarter">Quarter</option>
                    </select>
                    <button onclick="fetchCashflowJP()">Load Statement</button>
                    <div class="scroll-container-x">
                        <table id="cashflowTableJP" border="1">
                            <div id="cashflowContainerJP"></div>
                        </table>
                    </div>
                </div>
            </div>`,
        'earnings-call-transcript-jp': `
            <div class="section" id="earnings-call-transcript-jp" onmouseover="expandSection(this)" onmouseleave="collapseSection(this)" onclick="toggleFixed(event, this)">
                <h2>Earnings Call Transcript</h2>
                <div class="content">
                    <input type="number" id="yearInputJP" placeholder="Enter Year">
                    <input type="number" id="quarterInputJP" placeholder="Enter Quarter">
                    <button onclick="fetchEarningsCallTranscriptJP()">Load Transcript</button>
                    <div class="scroll-container-y scroll-container-x" id="earningsCallTranscriptContainerJP">
                        <!-- Transcription content will be displayed here -->
                    </div>
                </div>
            </div>`,
        'earnings-call-calendar-jp': `
            <div class="section" id="earnings-call-calendar-jp" onmouseover="expandSection(this)" onmouseleave="collapseSection(this)" onclick="toggleFixed(event, this)">
                <h2>Earnings Call Calendar</h2>
                <div class="content">
                    <input type="date" id="fromDateJP" placeholder="From Date">
                    <input type="date" id="toDateJP" placeholder="To Date">
                    <button onclick="fetchEarningsCallCalendarJP()">Load Calendar</button>
                    <div class="scroll-container">
                        <div id="earningsCallCalendarContainerJP"></div>
                    </div>
                </div>
            </div>`,
        'historical-earnings-jp': `
            <div class="section" id="historical-earnings-jp" onmouseover="expandSection(this)" onmouseleave="collapseSection(this)" onclick="toggleFixed(event, this)">
                <h2>Historical and Future Earnings</h2>
                <div class="content">
                    <input type="date" id="fromDate_1_jp" placeholder="From Date">
                    <input type="date" id="toDate_1_jp" placeholder="To Date">
                    <button onclick="fetch_historical_earning_calendarJP()">Load Calendar</button>
                    <div class="scroll-container" id="historicalEarningsContainerJP">
                        <!-- Data table will be displayed here -->
                    </div>
                </div>
            </div>`,
        'dividend-calendar-jp': `
            <div class="section" id="dividend-calendar-jp" onmouseover="expandSection(this)" onmouseleave="collapseSection(this)" onclick="toggleFixed(event, this)">
                <h2>Dividend Calendar</h2>
                <div class="content">
                    <input type="date" id="fromDate_2_jp" placeholder="From Date">
                    <input type="date" id="toDate_2_jp" placeholder="To Date">
                    <button onclick="fetch_stock_dividend_calendarJP()">Load Calendar</button>
                    <div class="scroll-container" id="stockDividendCalendarContainerJP">
                        <!-- Data table will be displayed here -->
                    </div>
                </div>
            </div>`,
        'insider-trades-jp': `
            <div class="section" id="insider-trades-jp" onmouseover="expandSection(this)" onmouseleave="collapseSection(this)" onclick="toggleFixed(event, this)">
                <h2>Insider Trades</h2>
                <div class="content">
                    <button onclick="fetchInsiderTradesJP()">Load Table</button>
                    <div class="scroll-container-x" id="insiderTradesContainerJP">
                        <!-- Data table will be displayed here -->
                    </div>
                </div>
            </div>`
    };

    const sectionContainerJP = document.getElementById('section-container-jp');
    sectionContainerJP.innerHTML = sections[sectionId] || '<p>Section not found</p>';
}



//////////////////////////////Profile//////////////////////////////////////////////
function fetchCompanyProfile(stockSymbol) {
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';
    const apiUrl = `https://financialmodelingprep.com/api/v3/profile/${stockSymbol}?apikey=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => displayCompanyProfile(data, document.getElementById('companyProfileContainer')))
        .catch(error => console.error('Error fetching data:', error));
}

function displayCompanyProfile(data, container) {
    if (!data || !Array.isArray(data) || data.length === 0) {
        container.innerHTML = '<p>Data not available.</p>';
        return;
    }

    const company = data[0];  // 假設返回的數據是一個包含單個公司信息的數組
    const website = company.website || 'N/A';

    // 清除之前的資料
    container.innerHTML = '';

    // 插入新的資料到 container 中
    container.innerHTML = `<p>Official Website: <a href="${website}" target="_blank">${website}</a></p>`;
}

/////////////////////////////財務收入 Income Statement////////////////////////////////////////
function fetchIncomeStatement(stockSymbol, country = 'us') {
    const period = country === 'us' ? document.getElementById('period').value : document.getElementById('period-jp').value;  // 獲取選擇的時段
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/income-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    const containerId = country === 'us' ? 'incomeStatementContainer' : 'incomeStatementContainerJP';
    fetchData_IncomeStatement(apiUrl, displayIncomeStatement, containerId);
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
    const period = document.getElementById('period_2').value;
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

function splitTranscriptIntoParagraphs(content) {
    // 使用正則表達式檢測常見的講者名稱或段落開頭
    const regex = /(Operator:|[A-Z][a-z]+ [A-Z][a-z]+:)/g;
    let parts = content.split(regex);

    // 組裝段落
    let paragraphs = [];
    for (let i = 1; i < parts.length; i += 2) {
        paragraphs.push(`<p><strong>${parts[i]}</strong> ${parts[i + 1] ? parts[i + 1] : ''}</p>`);
    }
    return paragraphs;
}

function displayEarningsCallTranscript(transcript, container) {
    if (!transcript || !transcript.content) {
        container.innerHTML = '<p>資料不可用。</p>';
        return;
    }

    // 將逐字稿內容分段
    let paragraphs = splitTranscriptIntoParagraphs(transcript.content);

    // 組裝HTML內容
    let htmlContent = `<div id="transcriptPreview">${paragraphs.slice(0, 3).join('')}...</div>`;
    htmlContent += `<div id="fullTranscript" style="display:none; white-space: normal;">${paragraphs.join('')}</div>`;
    htmlContent += '<button id="expandButton" class="transcript-button" onclick="expandTranscript(event)">Read More</button>';
    htmlContent += '<button id="collapseButton" class="transcript-button" style="display: none;" onclick="collapseTranscript(event)">Read Less</button>';
    htmlContent += '<button id="copyButton" class="transcript-button" onclick="copyTranscript()">Copy</button>';
    container.innerHTML = htmlContent;
}

function expandTranscript(event) {
    event.stopPropagation(); // 防止觸發區塊固定功能
    const section = event.target.closest('.section');
    section.classList.add('fixed'); // 固定区块展开
    document.getElementById('transcriptPreview').style.display = 'none';
    document.getElementById('fullTranscript').style.display = 'block';
    document.getElementById('expandButton').style.display = 'none';
    document.getElementById('collapseButton').style.display = 'inline';
}

function collapseTranscript(event) {
    event.stopPropagation(); // 防止觸發區塊固定功能
    const section = event.target.closest('.section');
    section.classList.remove('fixed'); // 取消区块固定
    document.getElementById('transcriptPreview').style.display = 'block';
    document.getElementById('fullTranscript').style.display = 'none';
    document.getElementById('expandButton').style.display = 'inline';
    document.getElementById('collapseButton').style.display = 'none';
}

function copyTranscript() {
    const fullTranscript = document.getElementById('fullTranscript').innerText;
    const textArea = document.createElement('textarea');
    textArea.value = fullTranscript;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('Transcript copied to clipboard!');
}

function fetchData_Transcript(apiUrl, callback, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '<p>Loading...</p>';
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
    setInterval(updateQueueLength, 5000); // 每5秒更新一次排程長度
});

function fetchFileList(newFileName = null) {
    console.log("Get file list from server...");
    fetch(`${baseUrl}/list_files`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response is abnormal ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log("File list successfully obtained:", data);
            const select = document.getElementById('ftpFileSelect');
            if (!select) {
                console.error('Element with ID "ftpFileSelect" not found');
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
                option.textContent = "No files available";
                option.disabled = true;
                select.appendChild(option);
            }
        })
        .catch(error => {
            console.error('Error getting file list:', error);
            const uploadResult = document.getElementById('upload-result');
            if (uploadResult) {
                uploadResult.innerText = 'An error occurred, please check the network connection or server status！\n' + error;
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

function fetchTextFileList(newTextFileName = null, isNewFile = false) {
    console.log("Get a list of text files from the server...");
    fetch(`${baseUrl}/list_text_files`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response is abnormal ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log("Text file list successfully obtained:", data);
            const select = document.getElementById('textFileSelect');
            if (!select) {
                console.error('Element with ID "textFileSelect" not found');
                return;
            }
            select.innerHTML = '';  // 清空之前的選項

            if (Array.isArray(data.files) && data.files.length > 0) {
                // Add the new file to the top if it exists
                if (newTextFileName && isNewFile) {
                    console.log(`Adding new file: ${newTextFileName}`);
                    const newOption = document.createElement('option');
                    const newFileNameWithTxt = newTextFileName.endsWith('.txt') ? newTextFileName : `${newTextFileName}.txt`;
                    newOption.value = encodeURIComponent(newFileNameWithTxt);
                    newOption.textContent = newFileNameWithTxt;
                    select.appendChild(newOption);
                }

                // Add the rest of the files
                data.files.forEach(fileInfo => {
                    const option = document.createElement('option');
                    const originalFileName = decodeURIComponent(fileInfo.original);
                    const fileNameWithTxt = originalFileName.endsWith('.txt') ? originalFileName : `${originalFileName}.txt`;
                    option.value = encodeURIComponent(fileNameWithTxt);
                    option.textContent = fileNameWithTxt;
                    select.appendChild(option);
                });

                // Select the new file if it exists, otherwise select the first option
                if (newTextFileName && isNewFile) {
                    const newFileNameWithTxt = newTextFileName.endsWith('.txt') ? newTextFileName : `${newTextFileName}.txt`;
                    select.value = encodeURIComponent(newFileNameWithTxt);
                } else {
                    select.selectedIndex = 0;
                }
            } else {
                const option = document.createElement('option');
                option.textContent = "No files available";
                option.disabled = true;
                select.appendChild(option);
            }
        })
        .catch(error => {
            console.error('獲取文字文件列表時出錯:', error);
            const uploadResult = document.getElementById('upload-result');
            if (uploadResult) {
                uploadResult.innerText = 'An error occurred, please check the network connection or server status！\n' + error;
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
        showAlert('Please select a file！');
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
            uploadProgressText.textContent = `File uploading... ${Math.round(percentComplete)}%`;
        }
    };

    xhr.onload = function () {
        uploadProgressContainer.style.display = 'none';
        uploadProgressText.style.display = 'none';
        if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            showAlert(response.message || 'The file has been successfully uploaded to the server');
            const newFileName = file.name;
            fetchFileList(newFileName);
            fileInput.value = '';
        } else if (xhr.status === 503) {
            showAlert('Another conversion process is in progress, please try again later');
        } else {
            const response = JSON.parse(xhr.responseText);
            showAlert('Upload failed, please try again！' + (response.error ? '<br>' + response.error : ''));
        }
    };

    xhr.onerror = function () {
        uploadProgressContainer.style.display = 'none';
        uploadProgressText.style.display = 'none';
        showAlert('Upload failed, please try again！');
    };

    xhr.send(formData);
}

function transcribeFromFTP() {
    const select = document.getElementById('ftpFileSelect');
    const encodedFilename = select.value;
    currentOriginalFileName = originalFileNames[encodedFilename];

    if (!encodedFilename) {
        showAlert('Please select a file！');
        return;
    }

    clearPreviousResult();
    document.getElementById('transcription-progress-container').style.display = 'block';
    document.getElementById('transcription-status').textContent = 'Submitting transcription request...';

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
                document.getElementById('transcription-status').textContent = 'The conversion has been scheduled, please wait....';
                startPolling(encodedFilename);
                return { message: 'Already added to schedule queue' };
            } else if (response.status === 503) {
                showAlert('The server is busy, please try again later');
            } else if (!response.ok) {
                throw new Error('Server error, please try again later');
            }
            return response.json();
        })
        .then(data => {
            if (data.message === 'Already added to schedule queue') {
                showAlert(data.message);
                document.getElementById('transcription-status').textContent = 'The conversion has been scheduled, please wait....';
                startPolling(encodedFilename);
            } else if (data.text) {
                displayTranscription(data);
                fetchTextFileList(currentOriginalFileName, true);
            } else {
                throw new Error('Expected response data not received');
            }
        })
        .catch(error => {
            document.getElementById('transcription-progress-container').style.display = 'none';
            console.error('Transcription error:', error);
            showAlert(error.message || 'An error occurred during transcription, please try again！');
        });
}

function startPolling(encodedFilename) {
    const statusElement = document.getElementById('transcription-status');
    statusElement.textContent = 'Tasks are being queued, please wait....';

    if (pollingInterval) {
        clearInterval(pollingInterval);
    }

    pollingInterval = setInterval(() => {
        fetch(`${baseUrl}/check_transcription_status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ filename: encodedFilename })
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'completed') {
                    clearInterval(pollingInterval);
                    fetchTranscriptionResult(encodedFilename);
                    statusElement.textContent = 'Transcription completed';
                } else if (data.status === 'in_progress') {
                    statusElement.textContent = `Transcription in progress... ${data.progress || ''}`;
                } else if (data.status === 'queued') {
                    statusElement.textContent = 'The task is still in the queue, please wait....';
                }
            })
            .catch(error => {
                clearInterval(pollingInterval);
                console.error('An error occurred while checking status:', error);
                showAlert('An error occurred while checking the transcription status, please check the results manually later');
                statusElement.textContent = 'Status check failed';
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
                fetchTextFileList(currentOriginalFileName, true);
            } else {
                showAlert('Failed to retrieve transcription result');
            }
        })
        .catch(error => {
            console.error('Error fetching transcription result:', error);
            showAlert('Error fetching transcription result, please try again later');
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
        container.innerHTML = '<p>No transcription content</p>';
        readMoreBtn.classList.add('hidden');
        readLessBtn.classList.add('hidden');
    }

    document.getElementById('transcription-progress-container').style.display = 'none';
    showAlert('Transcription completed');
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
        alert('Please select a text file!');
        return;
    }

    // 將檔案名稱從 URL 編碼轉回 UTF-8
    const decodedFileName = decodeURIComponent(textFileName);

    const downloadUrl = `${baseUrl}/download_text_file/${encodeURIComponent(decodedFileName)}`;

    console.log("Starting file download:", downloadUrl);

    fetch(downloadUrl, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.blob();
        })
        .then(blob => {
            console.log("File downloaded successfully, processing Blob data...");
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = decodedFileName; // 使用解碼後的檔案名稱
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        })
        .catch(error => {
            console.error('Error downloading file:', error);
            alert('Download failed, please check network connection or server status!\n' + error);
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
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const queueLengthElement = document.getElementById('queueLength');
            queueLengthElement.innerText = data.queueLength;
        })
        .catch(error => {
            console.error('Error fetching queue length:', error);
        });
}