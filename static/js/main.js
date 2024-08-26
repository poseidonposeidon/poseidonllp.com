//////////////////////////////////////////////////////////////////////////////
let activeSection = null;

/////////////////////////////////////////////
// function expandSection(element) {
//     const content = element.querySelector('.content');
//     if (!element.classList.contains('fixed')) {
//         content.style.maxHeight = '1000px';
//         content.style.opacity = '1';
//         content.style.paddingTop = '20px';
//         content.style.paddingBottom = '20px';
//     }
// }

function collapseSection(element) {
    const content = element.querySelector('.content');
    if (!element.classList.contains('fixed')) {
        content.style.maxHeight = '0px';
        content.style.opacity = '0';
        content.style.paddingTop = '0';
        content.style.paddingBottom = '0';
    }
}

// function toggleFixed(event, element) {
//     if (event.target.tagName === 'SELECT' || event.target.tagName === 'BUTTON' || event.target.tagName === 'INPUT') {
//         return;
//     }
//     const content = element.querySelector('.content');
//     if (content.style.maxHeight !== '0px' && !element.classList.contains('fixed')) {
//         element.classList.add('fixed');
//     } else {
//         element.classList.remove('fixed');
//         collapseSection(element);
//     }
// }

function toggleSection(event, sectionId) {
    event.preventDefault();
    const section = document.querySelector(sectionId);
    if (!section) {
        console.error('Section not found:', sectionId);
        return;
    }

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
    document.querySelectorAll('#info-section, #ai_box,#jp-info-section,#tw-info-section,#eu-info-section,#kr-info-section,#hk-info-section,#cn-info-section').forEach(section => {
        section.style.display = 'none';
    });
});

////////////////////////////////////////////////////////////////////////////

function loadSection(sectionId) {
    const sections = {
        'income-statement': `
            <div class="section" id="income-statement">
                <h2>Income Statement</h2>
                <div class="content scroll-container-x">
                    <label for="period">Select Period:</label>
                    <select id="period">
                        <option value="annual">Annual</option>
                        <option value="quarter">Quarter</option>
                    </select>
                    
                    <!-- 添加年份範圍選單 -->
                    <label for="yearRange">Select Year Range:</label>
                    <select id="yearRange" onchange="updateDisplayedYears()">
                        <option value="3">Last 3 Years</option>
                        <option value="5">Last 5 Years</option>
                        <option value="10">Last 10 Years</option>
                        <option value="all">All Years</option>
                    </select>
                    
                    <button onclick="fetchIncomeStatement()">Load Statement</button>
                    <div id="incomeStatementContainer"></div>
                </div>
            </div>`,
        'balance-sheet': `
            <div class="section" id="balance-sheet">
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
            <div class="section" id="cashflow-statement">
                <h2>Cashflow Statement</h2>
                <div class="content scroll-container-x">
                    <label for="period_3">Select Period:</label>
                    <select id="period_3">
                        <option value="annual">Annual</option>
                        <option value="quarter">Quarter</option>
                    </select>
                    <button onclick="fetchCashflow()">Load Statement</button>
                    <div id="cashflowContainer"></div>
                </div>
            </div>`,
        'earnings-call-transcript': `
            <div class="section" id="earnings-call-transcript">
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
            <div class="section" id="earnings-call-calendar">
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
            <div class="section" id="historical-earnings">
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
            <div class="section" id="dividend-calendar">
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
            <div class="section" id="insider-trades">
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
        'income-statement': `
            <div class="section" id="income-statement-JP">
                <h2>Income Statement</h2>
                <div class="content scroll-container-x">
                    <label for="periodJP">Select Period:</label>
                    <select id="periodJP">
                        <option value="annual">Annual</option>
                        <option value="quarter">Quarter</option>
                    </select>
                    <button onclick="fetchJPIncomeStatement()">Load Statement</button>
                    <div id="incomeStatementContainerJP"></div>
                </div>
            </div>`,
        'balance-sheet': `
            <div class="section" id="balance-sheet-JP">
                <h2>Balance Sheet Statements</h2>
                <div class="content scroll-container-x">
                    <label for="periodJP_2">Select Period:</label>
                    <select id="periodJP_2">
                        <option value="annual">Annual</option>
                        <option value="quarter">Quarter</option>
                    </select>
                    <button onclick="fetchJPBalanceSheet()">Load Statement</button>
                    <div id="balanceSheetContainerJP"></div>
                </div>
            </div>`,
        'cashflow-statement': `
            <div class="section" id="cashflow-statement-JP">
                <h2>Cashflow Statement</h2>
                <div class="content scroll-container-x">
                    <label for="periodJP_3">Select Period:</label>
                    <select id="periodJP_3">
                        <option value="annual">Annual</option>
                        <option value="quarter">Quarter</option>
                    </select>
                    <button onclick="fetchJPCashflow()">Load Statement</button>
                    <div id="cashflowContainerJP"></div>
                </div>
            </div>`,
        'earnings-call-transcript': `
            <div class="section" id="earnings-call-transcript-JP">
                <h2>Earnings Call Transcript</h2>
                <div class="content">
                    <input type="number" id="yearInputJP" placeholder="Enter Year">
                    <input type="number" id="quarterInputJP" placeholder="Enter Quarter">
                    <button onclick="fetchJPEarningsCallTranscript()">Load Transcript</button>
                    <div class="scroll-container-y scroll-container-x" id="earningsCallTranscriptContainerJP">
                        <!-- Transcription content will be displayed here -->
                    </div>
                </div>
            </div>`,
        'earnings-call-calendar': `
            <div class="section" id="earnings-call-calendar-JP">
                <h2>Earnings Call Calendar</h2>
                <div class="content">
                    <input type="date" id="fromDateJP" placeholder="From Date">
                    <input type="date" id="toDateJP" placeholder="To Date">
                    <button onclick="fetchJPEarningsCallCalendar()">Load Calendar</button>
                    <div class="scroll-container">
                        <div id="earningsCallCalendarContainerJP"></div>
                    </div>
                </div>
            </div>`,
        'historical-earnings': `
            <div class="section" id="historical-earnings-JP">
                <h2>Historical and Future Earnings</h2>
                <div class="content">
                    <input type="date" id="fromDateJP_1" placeholder="From Date">
                    <input type="date" id="toDateJP_1" placeholder="To Date">
                    <button onclick="fetchJPHistoricalEarnings()">Load Calendar</button>
                    <div class="scroll-container" id="historicalEarningsContainerJP">
                        <!-- Data table will be displayed here -->
                    </div>
                </div>
            </div>`,
        'dividend-calendar': `
            <div class="section" id="dividend-calendar-JP">
                <h2>Dividend Calendar</h2>
                <div class="content">
                    <input type="date" id="fromDate_2-JP" placeholder="From Date">
                    <input type="date" id="toDate_2-JP" placeholder="To Date">
                    <button onclick="fetchJPStockDividendCalendar()">Load Calendar</button>
                    <div class="scroll-container" id="stockDividendCalendarContainerJP">
                        <!-- Data table will be displayed here -->
                    </div>
                </div>
            </div>`,
        'insider-trades': `
            <div class="section" id="insider-trades-JP">
                <h2>Insider Trades</h2>
                <div class="content">
                    <button onclick="fetchJPInsiderTrades()">Load Table</button>
                    <div class="scroll-container-x" id="insiderTradesContainerJP">
                        <!-- Data table will be displayed here -->
                    </div>
                </div>
            </div>`
    };

    const sectionContainer = document.getElementById('section-container-JP');
    sectionContainer.innerHTML = sections[sectionId] || '<p>Section not found</p>';
}

function loadSectionTW(sectionId) {
    const sections = {
        'income-statement': `
            <div class="section" id="income-statement-TW">
                <h2>Income Statement</h2>
                <div class="content scroll-container-x">
                    <label for="periodTW">Select Period:</label>
                    <select id="periodTW">
                        <option value="annual">Annual</option>
                        <option value="quarter">Quarter</option>
                    </select>
                    <button onclick="fetchTWIncomeStatement()">Load Statement</button>
                    <div id="incomeStatementContainerTW"></div>
                </div>
            </div>`,
        'balance-sheet': `
            <div class="section" id="balance-sheet-TW">
                <h2>Balance Sheet Statements</h2>
                <div class="content scroll-container-x">
                    <label for="periodTW_2">Select Period:</label>
                    <select id="periodTW_2">
                        <option value="annual">Annual</option>
                        <option value="quarter">Quarter</option>
                    </select>
                    <button onclick="fetchTWBalanceSheet()">Load Statement</button>
                    <div id="balanceSheetContainerTW"></div>
                </div>
            </div>`,
        'cashflow-statement': `
            <div class="section" id="cashflow-statement-TW">
                <h2>Cashflow Statement</h2>
                <div class="content scroll-container-x">
                    <label for="periodTW_3">Select Period:</label>
                    <select id="periodTW_3">
                        <option value="annual">Annual</option>
                        <option value="quarter">Quarter</option>
                    </select>
                    <button onclick="fetchTWCashflow()">Load Statement</button>
                    <div id="cashflowContainerTW"></div>
                </div>
            </div>`,
        'earnings-call-transcript': `
            <div class="section" id="earnings-call-transcript-TW">
                <h2>Earnings Call Transcript</h2>
                <div class="content">
                    <input type="number" id="yearInputTW" placeholder="Enter Year">
                    <input type="number" id="quarterInputTW" placeholder="Enter Quarter">
                    <button onclick="fetchTWEarningsCallTranscript()">Load Transcript</button>
                    <div class="scroll-container-y scroll-container-x" id="earningsCallTranscriptContainerTW">
                        <!-- Transcription content will be displayed here -->
                    </div>
                </div>
            </div>`,
        'earnings-call-calendar': `
            <div class="section" id="earnings-call-calendar-TW">
                <h2>Earnings Call Calendar</h2>
                <div class="content">
                    <input type="date" id="fromDateTW" placeholder="From Date">
                    <input type="date" id="toDateTW" placeholder="To Date">
                    <button onclick="fetchTWEarningsCallCalendar()">Load Calendar</button>
                    <div class="scroll-container">
                        <div id="earningsCallCalendarContainerTW"></div>
                    </div>
                </div>
            </div>`
    };

    const sectionContainer = document.getElementById('section-container-TW');
    sectionContainer.innerHTML = sections[sectionId] || '<p>Section not found</p>';
}

function loadSectionEU(sectionId) {
    const sectionsEU = {
        'income-statement': `
            <div class="section" id="income-statement-eu">
                <h2>Income Statement</h2>
                <div class="content scroll-container-x">
                    <label for="periodEU">Select Period:</label>
                    <select id="periodEU">
                        <option value="annual">Annual</option>
                        <option value="quarter">Quarter</option>
                    </select>
                    <button onclick="fetchEUIncomeStatement()">Load Statement</button>
                    <div id="incomeStatementContainerEU"></div>
                </div>
            </div>`,
        'balance-sheet': `
            <div class="section" id="balance-sheet-eu">
                <h2>Balance Sheet Statements</h2>
                <div class="content scroll-container-x">
                    <label for="period_2EU">Select Period:</label>
                    <select id="period_2EU">
                        <option value="annual">Annual</option>
                        <option value="quarter">Quarter</option>
                    </select>
                    <button onclick="fetchEUBalanceSheet()">Load Statement</button>
                    <div id="balanceSheetContainerEU"></div>
                </div>
            </div>`,
        'cashflow-statement': `
            <div class="section" id="cashflow-statement-eu">
                <h2>Cashflow Statement</h2>
                <div class="content scroll-container-x">
                    <label for="period_3EU">Select Period:</label>
                    <select id="period_3EU">
                        <option value="annual">Annual</option>
                        <option value="quarter">Quarter</option>
                    </select>
                    <button onclick="fetchEUCashflow()">Load Statement</button>
                    <div id="cashflowContainerEU"></div>
                </div>
            </div>`,
        'earnings-call-transcript': `
            <div class="section" id="earnings-call-transcript-eu">
                <h2>Earnings Call Transcript</h2>
                <div class="content">
                    <input type="number" id="yearInputEU" placeholder="Enter Year">
                    <input type="number" id="quarterInputEU" placeholder="Enter Quarter">
                    <button onclick="fetchEUEarningsCallTranscript()">Load Transcript</button>
                    <div class="scroll-container-y scroll-container-x" id="earningsCallTranscriptContainerEU">
                        <!-- Transcription content will be displayed here -->
                    </div>
                </div>
            </div>`,
        'earnings-call-calendar': `
            <div class="section" id="earnings-call-calendar-eu">
                <h2>Earnings Call Calendar</h2>
                <div class="content">
                    <input type="date" id="fromDateEU" placeholder="From Date">
                    <input type="date" id="toDateEU" placeholder="To Date">
                    <button onclick="fetchEUEarningsCallCalendar()">Load Calendar</button>
                    <div class="scroll-container">
                        <div id="earningsCallCalendarContainerEU"></div>
                    </div>
                </div>
            </div>`,
        'historical-earnings': `
            <div class="section" id="historical-earnings-eu">
                <h2>Historical and Future Earnings</h2>
                <div class="content">
                    <input type="date" id="fromDate_1EU" placeholder="From Date">
                    <input type="date" id="toDate_1EU" placeholder="To Date">
                    <button onclick="fetchEUHistoricalEarnings()">Load Calendar</button>
                    <div class="scroll-container" id="historicalEarningsContainerEU">
                        <!-- Data table will be displayed here -->
                    </div>
                </div>
            </div>`,
        'dividend-calendar': `
            <div class="section" id="dividend-calendar-eu">
                <h2>Dividend Calendar</h2>
                <div class="content">
                    <input type="date" id="fromDate_2EU" placeholder="From Date">
                    <input type="date" id="toDate_2EU" placeholder="To Date">
                    <button onclick="fetchEUDividendCalendar()">Load Calendar</button>
                    <div class="scroll-container" id="stockDividendCalendarContainerEU">
                        <!-- Data table will be displayed here -->
                    </div>
                </div>
            </div>`,
        'insider-trades': `
            <div class="section" id="insider-trades-eu">
                <h2>Insider Trades</h2>
                <div class="content">
                    <button onclick="fetchEUInsiderTrades()">Load Table</button>
                    <div class="scroll-container-x" id="insiderTradesContainerEU">
                        <!-- Data table will be displayed here -->
                    </div>
                </div>
            </div>`
    };

    const sectionContainerEU = document.getElementById('section-container-EU');
    sectionContainerEU.innerHTML = sectionsEU[sectionId] || '<p>Section not found</p>';
}

function loadSectionKR(sectionId) {
    const sectionsKR = {
        'income-statement': `
            <div class="section" id="income-statement-kr">
                <h2>Income Statement</h2>
                <div class="content scroll-container-x">
                    <label for="periodKR">Select Period:</label>
                    <select id="periodKR">
                        <option value="annual">Annual</option>
                        <option value="quarter">Quarter</option>
                    </select>
                    <button onclick="fetchKRIncomeStatement()">Load Statement</button>
                    <div id="incomeStatementContainerKR"></div>
                </div>
            </div>`,
        'balance-sheet': `
            <div class="section" id="balance-sheet-kr">
                <h2>Balance Sheet Statements</h2>
                <div class="content scroll-container-x">
                    <label for="period_2KR">Select Period:</label>
                    <select id="period_2KR">
                        <option value="annual">Annual</option>
                        <option value="quarter">Quarter</option>
                    </select>
                    <button onclick="fetchKRBalanceSheet()">Load Statement</button>
                    <div id="balanceSheetContainerKR"></div>
                </div>
            </div>`,
        'cashflow-statement': `
            <div class="section" id="cashflow-statement-kr">
                <h2>Cashflow Statement</h2>
                <div class="content scroll-container-x">
                    <label for="period_3KR">Select Period:</label>
                    <select id="period_3KR">
                        <option value="annual">Annual</option>
                        <option value="quarter">Quarter</option>
                    </select>
                    <button onclick="fetchKRCashflow()">Load Statement</button>
                    <div id="cashflowContainerKR"></div>
                </div>
            </div>`,
        'earnings-call-transcript': `
            <div class="section" id="earnings-call-transcript-kr">
                <h2>Earnings Call Transcript</h2>
                <div class="content">
                    <input type="number" id="yearInputKR" placeholder="Enter Year">
                    <input type="number" id="quarterInputKR" placeholder="Enter Quarter">
                    <button onclick="fetchKREarningsCallTranscript()">Load Transcript</button>
                    <div class="scroll-container-y scroll-container-x" id="earningsCallTranscriptContainerKR">
                        <!-- Transcription content will be displayed here -->
                    </div>
                </div>
            </div>`,
        'earnings-call-calendar': `
            <div class="section" id="earnings-call-calendar-kr">
                <h2>Earnings Call Calendar</h2>
                <div class="content">
                    <input type="date" id="fromDateKR" placeholder="From Date">
                    <input type="date" id="toDateKR" placeholder="To Date">
                    <button onclick="fetchKREarningsCallCalendar()">Load Calendar</button>
                    <div class="scroll-container">
                        <div id="earningsCallCalendarContainerKR"></div>
                    </div>
                </div>
            </div>`,
        'historical-earnings': `
            <div class="section" id="historical-earnings-kr">
                <h2>Historical and Future Earnings</h2>
                <div class="content">
                    <input type="date" id="fromDate_1KR" placeholder="From Date">
                    <input type="date" id="toDate_1KR" placeholder="To Date">
                    <button onclick="fetchKRHistoricalEarnings()">Load Calendar</button>
                    <div class="scroll-container" id="historicalEarningsContainerKR">
                        <!-- Data table will be displayed here -->
                    </div>
                </div>
            </div>`,
        'dividend-calendar': `
            <div class="section" id="dividend-calendar-kr">
                <h2>Dividend Calendar</h2>
                <div class="content">
                    <input type="date" id="fromDate_2KR" placeholder="From Date">
                    <input type="date" id="toDate_2KR" placeholder="To Date">
                    <button onclick="fetchKRDividendCalendar()">Load Calendar</button>
                    <div class="scroll-container" id="stockDividendCalendarContainerKR">
                        <!-- Data table will be displayed here -->
                    </div>
                </div>
            </div>`,
        'insider-trades': `
            <div class="section" id="insider-trades-kr">
                <h2>Insider Trades</h2>
                <div class="content">
                    <button onclick="fetchKRInsiderTrades()">Load Table</button>
                    <div class="scroll-container-x" id="insiderTradesContainerKR">
                        <!-- Data table will be displayed here -->
                    </div>
                </div>
            </div>`
    };

    const sectionContainerKR = document.getElementById('section-container-KR');
    sectionContainerKR.innerHTML = sectionsKR[sectionId] || '<p>Section not found</p>';
}

function loadSectionHK(sectionId) {
    const sectionsHK = {
        'income-statement': `
            <div class="section" id="income-statement-hk">
                <h2>Income Statement</h2>
                <div class="content scroll-container-x">
                    <label for="periodHK">Select Period:</label>
                    <select id="periodHK">
                        <option value="annual">Annual</option>
                        <option value="quarter">Quarter</option>
                    </select>
                    <button onclick="fetchHKIncomeStatement()">Load Statement</button>
                    <div id="incomeStatementContainerHK"></div>
                </div>
            </div>`,
        'balance-sheet': `
            <div class="section" id="balance-sheet-hk">
                <h2>Balance Sheet Statements</h2>
                <div class="content scroll-container-x">
                    <label for="period_2HK">Select Period:</label>
                    <select id="period_2HK">
                        <option value="annual">Annual</option>
                        <option value="quarter">Quarter</option>
                    </select>
                    <button onclick="fetchHKBalanceSheet()">Load Statement</button>
                    <div id="balanceSheetContainerHK"></div>
                </div>
            </div>`,
        'cashflow-statement': `
            <div class="section" id="cashflow-statement-hk">
                <h2>Cashflow Statement</h2>
                <div class="content scroll-container-x">
                    <label for="period_3HK">Select Period:</label>
                    <select id="period_3HK">
                        <option value="annual">Annual</option>
                        <option value="quarter">Quarter</option>
                    </select>
                    <button onclick="fetchHKCashflow()">Load Statement</button>
                    <div id="cashflowContainerHK"></div>
                </div>
            </div>`,
        'earnings-call-transcript': `
            <div class="section" id="earnings-call-transcript-hk">
                <h2>Earnings Call Transcript</h2>
                <div class="content">
                    <input type="number" id="yearInputHK" placeholder="Enter Year">
                    <input type="number" id="quarterInputHK" placeholder="Enter Quarter">
                    <button onclick="fetchHKEarningsCallTranscript()">Load Transcript</button>
                    <div class="scroll-container-y scroll-container-x" id="earningsCallTranscriptContainerHK">
                        <!-- Transcription content will be displayed here -->
                    </div>
                </div>
            </div>`,
        'earnings-call-calendar': `
            <div class="section" id="earnings-call-calendar-hk">
                <h2>Earnings Call Calendar</h2>
                <div class="content">
                    <input type="date" id="fromDateHK" placeholder="From Date">
                    <input type="date" id="toDateHK" placeholder="To Date">
                    <button onclick="fetchHKEarningsCallCalendar()">Load Calendar</button>
                    <div class="scroll-container">
                        <div id="earningsCallCalendarContainerHK"></div>
                    </div>
                </div>
            </div>`,
        'historical-earnings': `
            <div class="section" id="historical-earnings-hk">
                <h2>Historical and Future Earnings</h2>
                <div class="content">
                    <input type="date" id="fromDate_1HK" placeholder="From Date">
                    <input type="date" id="toDate_1HK" placeholder="To Date">
                    <button onclick="fetchHKHistoricalEarnings()">Load Calendar</button>
                    <div class="scroll-container" id="historicalEarningsContainerHK">
                        <!-- Data table will be displayed here -->
                    </div>
                </div>
            </div>`,
        'dividend-calendar': `
            <div class="section" id="dividend-calendar-hk">
                <h2>Dividend Calendar</h2>
                <div class="content">
                    <input type="date" id="fromDate_2HK" placeholder="From Date">
                    <input type="date" id="toDate_2HK" placeholder="To Date">
                    <button onclick="fetchHKDividendCalendar()">Load Calendar</button>
                    <div class="scroll-container" id="stockDividendCalendarContainerHK">
                        <!-- Data table will be displayed here -->
                    </div>
                </div>
            </div>`,
        'insider-trades': `
            <div class="section" id="insider-trades-hk">
                <h2>Insider Trades</h2>
                <div class="content">
                    <button onclick="fetchHKInsiderTrades()">Load Table</button>
                    <div class="scroll-container-x" id="insiderTradesContainerHK">
                        <!-- Data table will be displayed here -->
                    </div>
                </div>
            </div>`
    };

    const sectionContainerHK = document.getElementById('section-container-HK');
    sectionContainerHK.innerHTML = sectionsHK[sectionId] || '<p>Section not found</p>';
}

function loadSectionCN(sectionId) {
    const sectionsCN = {
        'income-statement': `
            <div class="section" id="income-statement-cn">
                <h2>Income Statement</h2>
                <div class="content scroll-container-x">
                    <label for="periodCN">Select Period:</label>
                    <select id="periodCN">
                        <option value="annual">Annual</option>
                        <option value="quarter">Quarter</option>
                    </select>
                    <button onclick="fetchCNIncomeStatement()">Load Statement</button>
                    <div id="incomeStatementContainerCN"></div>
                </div>
            </div>`,
        'balance-sheet': `
            <div class="section" id="balance-sheet-cn">
                <h2>Balance Sheet Statements</h2>
                <div class="content scroll-container-x">
                    <label for="period_2CN">Select Period:</label>
                    <select id="period_2CN">
                        <option value="annual">Annual</option>
                        <option value="quarter">Quarter</option>
                    </select>
                    <button onclick="fetchCNBalanceSheet()">Load Statement</button>
                    <div id="balanceSheetContainerCN"></div>
                </div>
            </div>`,
        'cashflow-statement': `
            <div class="section" id="cashflow-statement-cn">
                <h2>Cashflow Statement</h2>
                <div class="content scroll-container-x">
                    <label for="period_3CN">Select Period:</label>
                    <select id="period_3CN">
                        <option value="annual">Annual</option>
                        <option value="quarter">Quarter</option>
                    </select>
                    <button onclick="fetchCNCashflow()">Load Statement</button>
                    <div id="cashflowContainerCN"></div>
                </div>
            </div>`,
        'earnings-call-transcript': `
            <div class="section" id="earnings-call-transcript-cn">
                <h2>Earnings Call Transcript</h2>
                <div class="content">
                    <input type="number" id="yearInputCN" placeholder="Enter Year">
                    <input type="number" id="quarterInputCN" placeholder="Enter Quarter">
                    <button onclick="fetchCNEarningsCallTranscript()">Load Transcript</button>
                    <div class="scroll-container-y scroll-container-x" id="earningsCallTranscriptContainerCN">
                        <!-- Transcription content will be displayed here -->
                    </div>
                </div>
            </div>`,
        'earnings-call-calendar': `
            <div class="section" id="earnings-call-calendar-cn">
                <h2>Earnings Call Calendar</h2>
                <div class="content">
                    <input type="date" id="fromDateCN" placeholder="From Date">
                    <input type="date" id="toDateCN" placeholder="To Date">
                    <button onclick="fetchCNEarningsCallCalendar()">Load Calendar</button>
                    <div class="scroll-container">
                        <div id="earningsCallCalendarContainerCN"></div>
                    </div>
                </div>
            </div>`,
        'historical-earnings': `
            <div class="section" id="historical-earnings-cn">
                <h2>Historical and Future Earnings</h2>
                <div class="content">
                    <input type="date" id="fromDate_1CN" placeholder="From Date">
                    <input type="date" id="toDate_1CN" placeholder="To Date">
                    <button onclick="fetchCNHistoricalEarnings()">Load Calendar</button>
                    <div class="scroll-container" id="historicalEarningsContainerCN">
                        <!-- Data table will be displayed here -->
                    </div>
                </div>
            </div>`,
        'dividend-calendar': `
            <div class="section" id="dividend-calendar-cn">
                <h2>Dividend Calendar</h2>
                <div class="content">
                    <input type="date" id="fromDate_2CN" placeholder="From Date">
                    <input type="date" id="toDate_2CN" placeholder="To Date">
                    <button onclick="fetchCNDividendCalendar()">Load Calendar</button>
                    <div class="scroll-container" id="stockDividendCalendarContainerCN">
                        <!-- Data table will be displayed here -->
                    </div>
                </div>
            </div>`,
        'insider-trades': `
            <div class="section" id="insider-trades-cn">
                <h2>Insider Trades</h2>
                <div class="content">
                    <button onclick="fetchCNInsiderTrades()">Load Table</button>
                    <div class="scroll-container-x" id="insiderTradesContainerCN">
                        <!-- Data table will be displayed here -->
                    </div>
                </div>
            </div>`
    };

    const sectionContainerCN = document.getElementById('section-container-CN');
    sectionContainerCN.innerHTML = sectionsCN[sectionId] || '<p>Section not found</p>';
}

function loadAIBoxSection(sectionId) {
    const sections = {
        'audio-transcription': `
            <div class="section" id="audio-transcription">
                <h2>Audio Transcription</h2>
                <div class="content">
                    <p id="queueStatus">Current files in queue: <span id="queueLength">0</span></p>
                    <div class="inline-container">
                        <input type="file" id="audioFile" accept="audio/*">
                        <button onclick="uploadToFTP()">Upload Audio File</button>
                        <select id="ftpFileSelect">
                            <option value="" disabled selected>Select a file to transcribe</option>
                        </select>
                        <button onclick="transcribeFromFTP()">Transcribe</button>
                        <select id="textFileSelect">
                            <option value="" disabled selected>Select a text file</option>
                        </select>
                        <button onclick="downloadTextFile()">Download Text File</button>
                    </div>
                    <div id="upload-progress-container" style="display: none;">
                        <div id="upload-progress-bar"></div>
                    </div>
                    <p id="upload-progress-text" style="text-align: center; margin-top: 10px; display: none;">Uploading file...</p>
                    <div id="transcription-progress-container" style="display: none; text-align: center;">
                        <div>
                            <div class="loader"></div>
                            <p id="transcription-status">Transcribing...</p>
                        </div>
                    </div>
                    <div class="scroll-container" id="transcriptionResult">
                        <!-- Transcription results will be displayed here -->
                    </div>
                    <div id="buttonContainer" style="display: none; gap: 10px; margin-top: 10px;">
                        <button id="copyBtn" onclick="copyToClipboard()">Copy</button>
                        <button id="readMoreBtn" onclick="toggleReadMore()">Read More</button>
                        <button id="readLessBtn" class="hidden" onclick="toggleReadMore()">Read Less</button>
                    </div>
                    <div id="alert-box" style="display: none;" class="alert">
                        <span id="alert-message"></span>
                        <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
                    </div>
                </div>
            </div>`
    };

    const sectionContainer = document.getElementById('aiBoxSectionContainer');
    sectionContainer.innerHTML = sections[sectionId] || '<p>Section not found</p>';
    if (sectionId === 'audio-transcription') {
        fetchFileList();
        fetchTextFileList();
        updateQueueLength();
        setInterval(updateQueueLength, 5000); // 每5秒更新一次排程長度
    }
}

//////////////////////////////////////////////////////////////////////////////
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

        const priceContainer = document.getElementById('PriceContainer');
        if (priceContainer) {
            priceContainer.innerHTML = ''; // Clear previous price data
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

        // Fetch and display company profile and price information
        clearSuggestions();
        fetchCompanyProfile(stockSymbol);  // Pass stockSymbol to fetchCompanyProfile
        fetchCompanyPrice(stockSymbol);    // Fetch and display stock price information

    }

    return stockSymbol;
}

function fetchJPStock() {
    const stockSymbol = document.getElementById('jpStockSymbol').value.trim() + ".T";
    const previousSymbol = document.getElementById('outputSymbolJP').getAttribute('data-last-symbol');

    if (stockSymbol !== previousSymbol) {
        document.getElementById('outputSymbolJP').innerText = 'Current query: ' + stockSymbol;
        document.getElementById('outputSymbolJP').setAttribute('data-last-symbol', stockSymbol);

        // Clear previous company data
        const companyProfileContainerJP = document.getElementById('companyProfileContainerJP');
        if (companyProfileContainerJP) {
            companyProfileContainerJP.innerHTML = '';
        }

        const priceContainerJP = document.getElementById('PriceContainerJP');
        if (priceContainerJP) {
            priceContainerJP.innerHTML = ''; // Clear previous price data
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

        // Fetch and display company profile and price information
        fetchJPCompanyProfile(stockSymbol);  // Pass stockSymbol to fetchJPCompanyProfile
        fetchJPCompanyPrice(stockSymbol);    // Fetch and display stock price information
        clearSuggestionsJP();
    }

    return stockSymbol;
}

async function fetchStockExchange(stockSymbol) {
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';
    const apiUrl = `https://financialmodelingprep.com/api/v3/search?query=${stockSymbol}&apikey=${apiKey}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(data); // 打印出返回的資料

        // 過濾出包含 .TW 或 .TWO 的結果
        const filteredData = data.filter(item => item.symbol.endsWith('.TW') || item.symbol.endsWith('.TWO'));
        if (filteredData.length > 0) {
            const match = filteredData.find(item => item.symbol.split('.')[0] === stockSymbol);
            return match ? match.exchangeShortName : null;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching stock exchange:', error);
        return null;
    }
}

async function fetchTWStock() {
    const stockSymbol = document.getElementById('twStockSymbol').value.trim();
    const previousSymbol = document.getElementById('outputSymbolTW').getAttribute('data-last-symbol');

    // 调用 API 来判断交易所类型
    const exchangeShortName = await fetchStockExchange(stockSymbol);
    if (!exchangeShortName) {
        alert('无法判断股票代码所属的交易所');
        return null;
    }

    let fullStockSymbol = '';
    if (exchangeShortName === 'TAI') {
        fullStockSymbol = stockSymbol + '.TW';
    } else if (exchangeShortName === 'TWO') {
        fullStockSymbol = stockSymbol + '.TWO';
    } else {
        alert('未知的交易所类型');
        return null;
    }

    if (fullStockSymbol !== previousSymbol) {
        document.getElementById('outputSymbolTW').innerText = 'Current query: ' + fullStockSymbol;
        document.getElementById('outputSymbolTW').setAttribute('data-last-symbol', fullStockSymbol);

        // 清除之前的公司资料
        const companyProfileContainerTW = document.getElementById('companyProfileContainerTW');
        if (companyProfileContainerTW) {
            companyProfileContainerTW.innerHTML = '';
        }

        const priceContainerTW = document.getElementById('PriceContainerTW');
        if (priceContainerTW) {
            priceContainerTW.innerHTML = ''; // 清除之前的价格资料
        }

        const containers = [
            'incomeStatementContainerTW',
            'balanceSheetContainerTW',
            'cashflowContainerTW',
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

        // Fetch and display company profile and price information
        fetchTWCompanyProfile(fullStockSymbol);  // 传递 fullStockSymbol 给 fetchTWCompanyProfile
        fetchTWCompanyPrice(fullStockSymbol);    // 获取并显示股票价格信息
        clearSuggestionsTW();
    }

    return fullStockSymbol;
}

function fetchEUStock() {
    const stockSymbol = document.getElementById('euStockSymbol').value.trim().toUpperCase();
    const previousSymbol = document.getElementById('outputSymbolEU').getAttribute('data-last-symbol');

    if (stockSymbol !== previousSymbol) {
        document.getElementById('outputSymbolEU').innerText = 'Current query: ' + stockSymbol;
        document.getElementById('outputSymbolEU').setAttribute('data-last-symbol', stockSymbol);

        // Clear previous company data
        const companyProfileContainerEU = document.getElementById('companyProfileContainerEU');
        if (companyProfileContainerEU) {
            companyProfileContainerEU.innerHTML = '';
        }

        const priceContainerEU = document.getElementById('PriceContainerEU');
        if (priceContainerEU) {
            priceContainerEU.innerHTML = ''; // Clear previous price data
        }

        const containersEU = [
            'incomeStatementContainerEU',
            'balanceSheetContainerEU',
            'cashflowContainerEU',
            'earningsCallTranscriptContainerEU',
            'earningsCallCalendarContainerEU',
            'historicalEarningsContainerEU',
            'stockDividendCalendarContainerEU',
            'insiderTradesContainerEU'
        ];

        containersEU.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '';
            }
        });

        const sectionsEU = document.querySelectorAll('.section');
        sectionsEU.forEach(section => {
            section.classList.remove('fixed');
            collapseSection(section);
        });

        // Fetch and display company profile and price information
        fetchEUCompanyProfile(stockSymbol);  // 获取并显示公司简介
        fetchEUCompanyPrice(stockSymbol);    // 获取并显示股票价格信息
        clearSuggestionsEU();
    }

    return stockSymbol;
}

function fetchKRStock() {
    const stockSymbol = document.getElementById('krStockSymbol').value.trim().toUpperCase();
    const previousSymbol = document.getElementById('outputSymbolKR').getAttribute('data-last-symbol');

    if (stockSymbol !== previousSymbol) {
        document.getElementById('outputSymbolKR').innerText = 'Current query: ' + stockSymbol;
        document.getElementById('outputSymbolKR').setAttribute('data-last-symbol', stockSymbol);

        // Clear previous company data
        const companyProfileContainerKR = document.getElementById('companyProfileContainerKR');
        if (companyProfileContainerKR) {
            companyProfileContainerKR.innerHTML = '';
        }

        const priceContainerKR = document.getElementById('PriceContainerKR');
        if (priceContainerKR) {
            priceContainerKR.innerHTML = ''; // Clear previous price data
        }

        const containersKR = [
            'incomeStatementContainerKR',
            'balanceSheetContainerKR',
            'cashflowContainerKR',
            'earningsCallTranscriptContainerKR',
            'earningsCallCalendarContainerKR',
            'historicalEarningsContainerKR',
            'stockDividendCalendarContainerKR',
            'insiderTradesContainerKR'
        ];

        containersKR.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '';
            }
        });

        const sectionsKR = document.querySelectorAll('.section');
        sectionsKR.forEach(section => {
            section.classList.remove('fixed');
            collapseSection(section);
        });

        // Fetch and display company profile and price information
        fetchKRCompanyProfile(stockSymbol);  // 获取并显示公司简介
        fetchKRCompanyPrice(stockSymbol);    // 获取并显示股票价格信息
        clearSuggestionsKR();
    }

    return stockSymbol;
}

function fetchHKStock() {
    const stockSymbol = document.getElementById('hkStockSymbol').value.trim() + ".HK";
    const previousSymbol = document.getElementById('outputSymbolHK').getAttribute('data-last-symbol');

    if (stockSymbol !== previousSymbol) {
        document.getElementById('outputSymbolHK').innerText = 'Current query: ' + stockSymbol;
        document.getElementById('outputSymbolHK').setAttribute('data-last-symbol', stockSymbol);

        // Clear previous company data
        const companyProfileContainerHK = document.getElementById('companyProfileContainerHK');
        if (companyProfileContainerHK) {
            companyProfileContainerHK.innerHTML = '';
        }

        const priceContainerHK = document.getElementById('PriceContainerHK');
        if (priceContainerHK) {
            priceContainerHK.innerHTML = ''; // Clear previous price data
        }

        const containersHK = [
            'incomeStatementContainerHK',
            'balanceSheetContainerHK',
            'cashflowContainerHK',
            'earningsCallTranscriptContainerHK',
            'earningsCallCalendarContainerHK',
            'historicalEarningsContainerHK',
            'stockDividendCalendarContainerHK',
            'insiderTradesContainerHK'
        ];

        containersHK.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '';
            }
        });

        const sectionsHK = document.querySelectorAll('.section');
        sectionsHK.forEach(section => {
            section.classList.remove('fixed');
            collapseSection(section);
        });

        // Fetch and display company profile and price information
        fetchHKCompanyProfile(stockSymbol);  // 获取并显示公司简介
        fetchHKCompanyPrice(stockSymbol);    // 获取并显示股票价格信息
        clearSuggestionsHK();
    }

    return stockSymbol;
}

function fetchCNStock() {
    const stockSymbol = document.getElementById('cnStockSymbol').value.trim();
    const previousSymbol = document.getElementById('outputSymbolCN').getAttribute('data-last-symbol');

    if (stockSymbol !== previousSymbol) {
        document.getElementById('outputSymbolCN').innerText = 'Current query: ' + stockSymbol;
        document.getElementById('outputSymbolCN').setAttribute('data-last-symbol', stockSymbol);

        // 清除之前的公司数据
        const companyProfileContainerCN = document.getElementById('companyProfileContainerCN');
        if (companyProfileContainerCN) {
            companyProfileContainerCN.innerHTML = '';
        }

        const priceContainerCN = document.getElementById('PriceContainerCN');
        if (priceContainerCN) {
            priceContainerCN.innerHTML = ''; // 清除之前的价格数据
        }

        const containersCN = [
            'incomeStatementContainerCN',
            'balanceSheetContainerCN',
            'cashflowContainerCN',
            'earningsCallTranscriptContainerCN',
            'earningsCallCalendarContainerCN',
            'historicalEarningsContainerCN',
            'stockDividendCalendarContainerCN',
            'insiderTradesContainerCN'
        ];

        containersCN.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '';
            }
        });

        const sectionsCN = document.querySelectorAll('.section');
        sectionsCN.forEach(section => {
            section.classList.remove('fixed');
            collapseSection(section);
        });

        // 获取并显示公司简介和价格信息
        fetchCNCompanyProfile(stockSymbol);  // 获取并显示公司简介
        fetchCNCompanyPrice(stockSymbol);    // 获取并显示股票价格信息
        clearSuggestionsCN();
    }

    return stockSymbol;
}

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

function addEnterKeyListener(inputId, buttonSelector) {
    document.getElementById(inputId).addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent form submission
            document.querySelector(buttonSelector).click(); // Trigger button click event

            // 隐藏建议框
            // clearSuggestions();
            // clearSuggestionsEU();
            // clearSuggestionsJP();
            // clearSuggestionsTW();
            // clearSuggestionsKR();
            // clearSuggestionsHK();
        }
    });
}
addEnterKeyListener("stockSymbol", "#usStockButton");
addEnterKeyListener("jpStockSymbol", "#jpStockButton");
addEnterKeyListener("twStockSymbol", "#twStockButton");
addEnterKeyListener("euStockSymbol", "#euStockButton");
addEnterKeyListener("krStockSymbol", "#krStockButton");
addEnterKeyListener("hkStockSymbol", "#hkStockButton");
addEnterKeyListener("cnStockSymbol", "#cnStockButton");

//////////////////建議/////////////////
//美股
document.getElementById('stockSymbol').addEventListener('input', async function() {
    const stockSymbol = this.value.trim().toUpperCase();
    const suggestionsContainer = document.getElementById('suggestions');

    if (stockSymbol.length > 0) {
        const stockData = await fetchStockSuggestions(stockSymbol);
        displaySuggestions(stockData);
        suggestionsContainer.classList.add('active'); // 显示建议框
    } else {
        clearSuggestions(); // 清空并隐藏建议列表
        suggestionsContainer.classList.remove('active');
    }
});

async function fetchStockSuggestions(stockSymbol) {
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';
    const apiUrl = `https://financialmodelingprep.com/api/v3/search?query=${stockSymbol}&apikey=${apiKey}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        // 过滤条件：只返回 currency 为 USD 的股票符号
        const filteredData = data.filter(stock => stock.currency === 'USD');
        return filteredData.map(stock => stock.symbol); // 仅返回股票符号
    } catch (error) {
        console.error('Error fetching stock data:', error);
        return [];
    }
}

function displaySuggestions(suggestions) {
    const suggestionsContainer = document.getElementById('suggestions');
    suggestionsContainer.innerHTML = ''; // 清空之前的建议列表

    if (suggestions.length > 0) {
        suggestions.forEach(symbol => {
            const suggestionDiv = document.createElement('div');
            suggestionDiv.textContent = symbol;
            suggestionDiv.addEventListener('click', () => {
                document.getElementById('stockSymbol').value = symbol;
                clearSuggestions(); // 选择后清空并隐藏建议列表
                suggestionsContainer.classList.remove('active');
            });
            suggestionsContainer.appendChild(suggestionDiv);
        });
        suggestionsContainer.classList.add('active'); // 显示建议框
    } else {
        suggestionsContainer.classList.remove('active'); // 如果没有建议，隐藏建议框
    }
}

function clearSuggestions() {
    const suggestionsContainer = document.getElementById('suggestions');
    suggestionsContainer.innerHTML = '';
    suggestionsContainer.classList.remove('active'); // 隐藏建议框
}

//歐股
document.getElementById('euStockSymbol').addEventListener('input', async function() {
    const stockSymbol = this.value.trim().toUpperCase();
    const suggestionsContainerEU = document.getElementById('suggestionsEU');

    if (stockSymbol.length > 0) {
        const stockData = await fetchStockSuggestionsEU(stockSymbol);
        displaySuggestionsEU(stockData);
        suggestionsContainerEU.classList.add('active'); // 显示建议框
    } else {
        clearSuggestionsEU(); // 清空并隐藏建议列表
        suggestionsContainerEU.classList.remove('active');
    }
});

async function fetchStockSuggestionsEU(stockSymbol) {
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';
    const apiUrl = `https://financialmodelingprep.com/api/v3/search?query=${stockSymbol}&apikey=${apiKey}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        // 过滤条件：只返回 currency 为 EUR 或 GBp 的股票符号
        const filteredData = data.filter(stock => stock.currency === 'EUR' || stock.currency === 'GBp');
        return filteredData.map(stock => stock.symbol); // 仅返回股票符号
    } catch (error) {
        console.error('Error fetching stock data:', error);
        return [];
    }
}

function displaySuggestionsEU(suggestions) {
    const suggestionsContainerEU = document.getElementById('suggestionsEU');
    suggestionsContainerEU.innerHTML = ''; // 清空之前的建议列表

    if (suggestions.length > 0) {
        suggestions.forEach(symbol => {
            const suggestionDiv = document.createElement('div');
            suggestionDiv.textContent = symbol;
            suggestionDiv.addEventListener('click', () => {
                document.getElementById('euStockSymbol').value = symbol;
                clearSuggestionsEU(); // 选择后清空并隐藏建议列表
                suggestionsContainerEU.classList.remove('active');
            });
            suggestionsContainerEU.appendChild(suggestionDiv);
        });
        suggestionsContainerEU.classList.add('active'); // 显示建议框
    } else {
        suggestionsContainerEU.classList.remove('active'); // 如果没有建议，隐藏建议框
    }
}

function clearSuggestionsEU() {
    const suggestionsContainerEU = document.getElementById('suggestionsEU');
    suggestionsContainerEU.innerHTML = '';
    suggestionsContainerEU.classList.remove('active'); // 隐藏建议框
}

//日股
document.getElementById('jpStockSymbol').addEventListener('input', async function() {
    const stockSymbol = this.value.trim().toUpperCase();
    const suggestionsContainerJP = document.getElementById('suggestionsJP');

    if (stockSymbol.length > 0) {
        const stockData = await fetchStockSuggestionsJP(stockSymbol);
        displaySuggestionsJP(stockData);
        suggestionsContainerJP.classList.add('active'); // 顯示建議框
    } else {
        clearSuggestionsJP(); // 清空並隱藏建議列表
        suggestionsContainerJP.classList.remove('active');
    }
});

async function fetchStockSuggestionsJP(stockSymbol) {
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';
    const apiUrl = `https://financialmodelingprep.com/api/v3/search?query=${stockSymbol}&apikey=${apiKey}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        // 過濾條件：只返回 currency 為 JPY 的股票符號
        const filteredData = data.filter(stock => stock.currency === 'JPY');
        return filteredData.map(stock => stock.symbol); // 僅返回股票符號
    } catch (error) {
        console.error('Error fetching stock data:', error);
        return [];
    }
}

function displaySuggestionsJP(suggestions) {
    const suggestionsContainerJP = document.getElementById('suggestionsJP');
    suggestionsContainerJP.innerHTML = ''; // 清空之前的建議列表

    if (suggestions.length > 0) {
        suggestions.forEach(symbol => {
            const suggestionDiv = document.createElement('div');
            suggestionDiv.textContent = symbol.replace('.T', ''); // 移除顯示中的 ".T"
            suggestionDiv.addEventListener('click', () => {
                document.getElementById('jpStockSymbol').value = symbol.replace('.T', ''); // 移除輸入框中的 ".T"
                clearSuggestionsJP(); // 選擇後清空並隱藏建議列表
                suggestionsContainerJP.classList.remove('active');
            });
            suggestionsContainerJP.appendChild(suggestionDiv);
        });
        suggestionsContainerJP.classList.add('active'); // 顯示建議框
    } else {
        suggestionsContainerJP.classList.remove('active'); // 如果沒有建議，隱藏建議框
    }
}

function clearSuggestionsJP() {
    const suggestionsContainerJP = document.getElementById('suggestionsJP');
    suggestionsContainerJP.innerHTML = '';
    suggestionsContainerJP.classList.remove('active'); // 隱藏建議框
}

//台股
document.getElementById('twStockSymbol').addEventListener('input', async function() {
    const stockSymbol = this.value.trim().toUpperCase();
    const suggestionsContainerTW = document.getElementById('suggestionsTW');

    if (stockSymbol.length > 0) {
        const stockData = await fetchStockSuggestionsTW(stockSymbol);
        displaySuggestionsTW(stockData);
        suggestionsContainerTW.classList.add('active'); // 显示建议框
    } else {
        clearSuggestionsTW(); // 清空并隐藏建议列表
        suggestionsContainerTW.classList.remove('active');
    }
});

async function fetchStockSuggestionsTW(stockSymbol) {
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';
    const apiUrl = `https://financialmodelingprep.com/api/v3/search?query=${stockSymbol}&apikey=${apiKey}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        // 过滤条件：只返回 currency 为 TWD 的股票符号
        const filteredData = data.filter(stock => stock.currency === 'TWD');

        // 先去除 ".TW"
        let symbols = filteredData.map(stock => stock.symbol.replace('.TW', ''));
        // 再处理 ".TWO" 的 "O"
        symbols = symbols.map(symbol => symbol.replace('O', ''));

        return symbols;
    } catch (error) {
        console.error('Error fetching stock data:', error);
        return [];
    }
}


function displaySuggestionsTW(suggestions) {
    const suggestionsContainerTW = document.getElementById('suggestionsTW');
    suggestionsContainerTW.innerHTML = ''; // 清空之前的建议列表

    if (suggestions.length > 0) {
        suggestions.forEach(symbol => {
            const suggestionDiv = document.createElement('div');
            suggestionDiv.textContent = symbol; // 显示去除 ".TW" 和 ".TWO" 的股票符号
            suggestionDiv.addEventListener('click', () => {
                document.getElementById('twStockSymbol').value = symbol; // 选中后也不包含 ".TW" 或 ".TWO"
                clearSuggestionsTW(); // 选择后清空并隐藏建议列表
                suggestionsContainerTW.classList.remove('active');
            });
            suggestionsContainerTW.appendChild(suggestionDiv);
        });
        suggestionsContainerTW.classList.add('active'); // 显示建议框
    } else {
        suggestionsContainerTW.classList.remove('active'); // 如果没有建议，隐藏建议框
    }
}

function clearSuggestionsTW() {
    const suggestionsContainerTW = document.getElementById('suggestionsTW');
    suggestionsContainerTW.innerHTML = '';
    suggestionsContainerTW.classList.remove('active'); // 隐藏建议框
}

// 韓股
document.getElementById('krStockSymbol').addEventListener('input', async function() {
    const stockSymbol = this.value.trim().toUpperCase();
    const suggestionsContainerKR = document.getElementById('suggestionsKR');

    if (stockSymbol.length > 0) {
        const stockData = await fetchStockSuggestionsKR(stockSymbol);
        displaySuggestionsKR(stockData);
        suggestionsContainerKR.classList.add('active'); // 显示建议框
    } else {
        clearSuggestionsKR(); // 清空并隐藏建议列表
        suggestionsContainerKR.classList.remove('active');
    }
});

async function fetchStockSuggestionsKR(stockSymbol) {
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';
    const apiUrl = `https://financialmodelingprep.com/api/v3/search?query=${stockSymbol}&apikey=${apiKey}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        // 过滤条件：只返回 currency 为 KRW 的股票符号
        const filteredData = data.filter(stock => stock.currency === 'KRW');
        return filteredData.map(stock => stock.symbol); // 仅返回股票符号
    } catch (error) {
        console.error('Error fetching stock data:', error);
        return [];
    }
}

function displaySuggestionsKR(suggestions) {
    const suggestionsContainerKR = document.getElementById('suggestionsKR');
    suggestionsContainerKR.innerHTML = ''; // 清空之前的建议列表

    if (suggestions.length > 0) {
        suggestions.forEach(symbol => {
            const suggestionDiv = document.createElement('div');
            suggestionDiv.textContent = symbol;
            suggestionDiv.addEventListener('click', () => {
                document.getElementById('krStockSymbol').value = symbol;
                clearSuggestionsKR(); // 选择后清空并隐藏建议列表
                suggestionsContainerKR.classList.remove('active');
            });
            suggestionsContainerKR.appendChild(suggestionDiv);
        });
        suggestionsContainerKR.classList.add('active'); // 显示建议框
    } else {
        suggestionsContainerKR.classList.remove('active'); // 如果没有建议，隐藏建议框
    }
}

function clearSuggestionsKR() {
    const suggestionsContainerKR = document.getElementById('suggestionsKR');
    suggestionsContainerKR.innerHTML = '';
    suggestionsContainerKR.classList.remove('active'); // 隐藏建议框
}

// 港股
document.getElementById('hkStockSymbol').addEventListener('input', async function() {
    const stockSymbol = this.value.trim().toUpperCase();
    const suggestionsContainerHK = document.getElementById('suggestionsHK');

    if (stockSymbol.length > 0) {
        const stockData = await fetchStockSuggestionsHK(stockSymbol);
        displaySuggestionsHK(stockData);
        suggestionsContainerHK.classList.add('active'); // 顯示建議框
    } else {
        clearSuggestionsHK(); // 清空並隱藏建議列表
        suggestionsContainerHK.classList.remove('active');
    }
});

async function fetchStockSuggestionsHK(stockSymbol) {
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';
    const apiUrl = `https://financialmodelingprep.com/api/v3/search?query=${stockSymbol}&apikey=${apiKey}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        // 過濾條件：只返回 currency 為 HKD 的股票符號
        const filteredData = data.filter(stock => stock.currency === 'HKD');
        return filteredData.map(stock => stock.symbol); // 僅返回股票符號
    } catch (error) {
        console.error('Error fetching stock data:', error);
        return [];
    }
}

function displaySuggestionsHK(suggestions) {
    const suggestionsContainerHK = document.getElementById('suggestionsHK');
    suggestionsContainerHK.innerHTML = ''; // 清空之前的建議列表

    if (suggestions.length > 0) {
        suggestions.forEach(symbol => {
            const cleanSymbol = symbol.replace('.HK', ''); // 移除顯示中的 ".HK"
            const suggestionDiv = document.createElement('div');
            suggestionDiv.textContent = cleanSymbol;
            suggestionDiv.addEventListener('click', () => {
                document.getElementById('hkStockSymbol').value = cleanSymbol; // 移除輸入框中的 ".HK"
                clearSuggestionsHK(); // 選擇後清空並隱藏建議列表
                suggestionsContainerHK.classList.remove('active');
            });
            suggestionsContainerHK.appendChild(suggestionDiv);
        });
        suggestionsContainerHK.classList.add('active'); // 顯示建議框
    } else {
        suggestionsContainerHK.classList.remove('active'); // 如果沒有建議，隱藏建議框
    }
}

function clearSuggestionsHK() {
    const suggestionsContainerHK = document.getElementById('suggestionsHK');
    suggestionsContainerHK.innerHTML = '';
    suggestionsContainerHK.classList.remove('active'); // 隱藏建議框
}

// 中國股
document.getElementById('cnStockSymbol').addEventListener('input', async function() {
    const stockSymbol = this.value.trim().toUpperCase();
    const suggestionsContainerCN = document.getElementById('suggestionsCN');

    if (stockSymbol.length > 0) {
        const stockData = await fetchStockSuggestionsCN(stockSymbol);
        displaySuggestionsCN(stockData);
        suggestionsContainerCN.classList.add('active'); // 显示建议框
    } else {
        clearSuggestionsCN(); // 清空并隐藏建议列表
        suggestionsContainerCN.classList.remove('active');
    }
});

async function fetchStockSuggestionsCN(stockSymbol) {
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';
    const apiUrl = `https://financialmodelingprep.com/api/v3/search?query=${stockSymbol}&apikey=${apiKey}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        // 过滤条件：只返回 currency 为 CNY 的股票符号
        const filteredData = data.filter(stock => stock.currency === 'CNY');
        return filteredData.map(stock => stock.symbol); // 仅返回股票符号
    } catch (error) {
        console.error('Error fetching stock data:', error);
        return [];
    }
}

function displaySuggestionsCN(suggestions) {
    const suggestionsContainerCN = document.getElementById('suggestionsCN');
    suggestionsContainerCN.innerHTML = ''; // 清空之前的建议列表

    if (suggestions.length > 0) {
        suggestions.forEach(symbol => {
            const suggestionDiv = document.createElement('div');
            suggestionDiv.textContent = symbol;
            suggestionDiv.addEventListener('click', () => {
                document.getElementById('cnStockSymbol').value = symbol;
                clearSuggestionsCN(); // 选择后清空并隐藏建议列表
                suggestionsContainerCN.classList.remove('active');
            });
            suggestionsContainerCN.appendChild(suggestionDiv);
        });
        suggestionsContainerCN.classList.add('active'); // 显示建议框
    } else {
        suggestionsContainerCN.classList.remove('active'); // 如果没有建议，隐藏建议框
    }
}

function clearSuggestionsCN() {
    const suggestionsContainerCN = document.getElementById('suggestionsCN');
    suggestionsContainerCN.innerHTML = '';
    suggestionsContainerCN.classList.remove('active'); // 隐藏建议框
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

function fetchJPCompanyProfile(stockSymbol) {
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf'; // 這裡填入你的API密鑰
    const apiUrl = `https://financialmodelingprep.com/api/v3/profile/${stockSymbol}?apikey=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => displayCompanyProfile(data, document.getElementById('companyProfileContainerJP')))
        .catch(error => console.error('Error fetching data:', error));
}

function fetchTWCompanyProfile(stockSymbol) {
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';
    const apiUrl = `https://financialmodelingprep.com/api/v3/profile/${stockSymbol}?apikey=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => displayCompanyProfile(data, document.getElementById('companyProfileContainerTW')))
        .catch(error => console.error('Error fetching data:', error));
}

function fetchEUCompanyProfile(stockSymbol) {
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';
    const apiUrl = `https://financialmodelingprep.com/api/v3/profile/${stockSymbol}?apikey=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => displayCompanyProfile(data, document.getElementById('companyProfileContainerEU')))
        .catch(error => console.error('Error fetching data:', error));
}

function fetchKRCompanyProfile(stockSymbol) {
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';
    const apiUrl = `https://financialmodelingprep.com/api/v3/profile/${stockSymbol}?apikey=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => displayCompanyProfile(data, document.getElementById('companyProfileContainerKR')))
        .catch(error => console.error('Error fetching data:', error));
}

function fetchHKCompanyProfile(stockSymbol) {
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';
    const apiUrl = `https://financialmodelingprep.com/api/v3/profile/${stockSymbol}?apikey=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => displayCompanyProfile(data, document.getElementById('companyProfileContainerHK')))
        .catch(error => console.error('Error fetching data:', error));
}

function fetchCNCompanyProfile(stockSymbol) {
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';
    const apiUrl = `https://financialmodelingprep.com/api/v3/profile/${stockSymbol}?apikey=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => displayCompanyProfile(data, document.getElementById('companyProfileContainerCN')))
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
//////////////////////////////Price//////////////////////////////////////////////
function fetchCompanyPrice(stockSymbol) {
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';
    const apiUrl = `https://financialmodelingprep.com/api/v3/quote/${stockSymbol}?apikey=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const priceContainer = document.getElementById('PriceContainer');
            if (data && data.length > 0) {
                displayCompanyPrice(data[0], priceContainer);  // Pass the first item in the array to the display function
            } else {
                priceContainer.innerHTML = '<p>No data found.</p>';
            }
        })
        .catch(error => console.error('Error fetching data:', error));
}

function fetchJPCompanyPrice(stockSymbol) {
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';
    const apiUrl = `https://financialmodelingprep.com/api/v3/quote/${stockSymbol}?apikey=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const priceContainerJP = document.getElementById('PriceContainerJP');
            if (data && data.length > 0) {
                displayCompanyPrice(data[0], priceContainerJP);  // 传递数组中的第一个项目给 displayCompanyPrice 函数
            } else {
                priceContainerJP.innerHTML = '<p>No data found.</p>';
            }
        })
        .catch(error => console.error('Error fetching data:', error));
}

function fetchTWCompanyPrice(fullStockSymbol) {
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';
    const apiUrl = `https://financialmodelingprep.com/api/v3/quote/${fullStockSymbol}?apikey=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const priceContainerTW = document.getElementById('PriceContainerTW');
            if (data && data.length > 0) {
                displayCompanyPrice(data[0], priceContainerTW);  // 传递数组中的第一个项目给 displayCompanyPrice 函数
            } else {
                priceContainerTW.innerHTML = '<p>No data found.</p>';
            }
        })
        .catch(error => console.error('Error fetching data:', error));
}

function fetchEUCompanyPrice(stockSymbol) {
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';
    const apiUrl = `https://financialmodelingprep.com/api/v3/quote/${stockSymbol}?apikey=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const priceContainerEU = document.getElementById('PriceContainerEU');
            if (data && data.length > 0) {
                displayCompanyPrice(data[0], priceContainerEU);  // 传递数组中的第一个项目给 displayCompanyPrice 函数
            } else {
                priceContainerEU.innerHTML = '<p>No data found.</p>';
            }
        })
        .catch(error => console.error('Error fetching data:', error));
}

function fetchKRCompanyPrice(stockSymbol) {
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';
    const apiUrl = `https://financialmodelingprep.com/api/v3/quote/${stockSymbol}?apikey=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const priceContainerKR = document.getElementById('PriceContainerKR');
            if (data && data.length > 0) {
                displayCompanyPrice(data[0], priceContainerKR);  // 传递数组中的第一个项目给 displayCompanyPrice 函数
            } else {
                priceContainerKR.innerHTML = '<p>No data found.</p>';
            }
        })
        .catch(error => console.error('Error fetching data:', error));
}

function fetchHKCompanyPrice(stockSymbol) {
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';
    const apiUrl = `https://financialmodelingprep.com/api/v3/quote/${stockSymbol}?apikey=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const priceContainerHK = document.getElementById('PriceContainerHK');
            if (data && data.length > 0) {
                displayCompanyPrice(data[0], priceContainerHK);  // 传递数组中的第一个项目给 displayCompanyPrice 函数
            } else {
                priceContainerHK.innerHTML = '<p>No data found.</p>';
            }
        })
        .catch(error => console.error('Error fetching data:', error));
}

function fetchCNCompanyPrice(stockSymbol) {
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';
    const apiUrl = `https://financialmodelingprep.com/api/v3/quote/${stockSymbol}?apikey=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const priceContainerCN = document.getElementById('PriceContainerCN');
            if (data && data.length > 0) {
                displayCompanyPrice(data[0], priceContainerCN);  // 传递数组中的第一个项目给 displayCompanyPrice 函数
            } else {
                priceContainerCN.innerHTML = '<p>No data found.</p>';
            }
        })
        .catch(error => console.error('Error fetching data:', error));
}

function displayCompanyPrice(data, container) {
    if (!data || typeof data !== 'object') {
        container.innerHTML = '<p>Data not available.</p>';
        return;
    }

    const price = data.price || 'N/A';
    const yearHigh = data.yearHigh || 'N/A';
    const yearLow = data.yearLow || 'N/A';

    // 清除之前的資料
    container.innerHTML = '';

    // 插入新的資料到 container 中
    container.innerHTML = `
        <p><strong>Current Price:</strong> $${price}</p>
        <p><strong>Year High:</strong> $${yearHigh}</p>
        <p><strong>Year Low:</strong> $${yearLow}</p>
    `;
}


/////////////////////////////財務收入 Income Statement////////////////////////////////////////

let incomeStatementChartInstances = {}; // 使用對象來存儲不同國家的圖表實例

function fetchIncomeStatement() {
    stockSymbol = fetchStock();
    const period = document.getElementById('period').value;
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/income-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_IncomeStatement(apiUrl, displayIncomeStatement, 'incomeStatementContainer', 'incomeStatementChart', 'operatingChart', period);
}

function fetchJPIncomeStatement() {
    stockSymbol = fetchJPStock();
    const period = document.getElementById('periodJP').value;
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/income-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_IncomeStatement(apiUrl, displayIncomeStatement, 'incomeStatementContainerJP', 'incomeStatementChartJP', 'operatingChartJP', period);
}

async function fetchTWIncomeStatement() {
    stockSymbol = await fetchTWStock();
    const period = document.getElementById('periodTW').value;
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/income-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_IncomeStatement(apiUrl, displayIncomeStatement, 'incomeStatementContainerTW', 'incomeStatementChartTW', 'operatingChartTW', period);
}

function fetchEUIncomeStatement() {
    const stockSymbol = fetchEUStock();
    const period = document.getElementById('periodEU').value;
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/income-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_IncomeStatement(apiUrl, displayIncomeStatement, 'incomeStatementContainerEU', 'incomeStatementChartEU', 'operatingChartEU', period);
}

function fetchKRIncomeStatement() {
    const stockSymbol = fetchKRStock();
    const period = document.getElementById('periodKR').value;
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/income-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_IncomeStatement(apiUrl, displayIncomeStatement, 'incomeStatementContainerKR', 'incomeStatementChartKR', 'operatingChartKR', period);
}

function fetchHKIncomeStatement() {
    const stockSymbol = fetchHKStock();
    const period = document.getElementById('periodHK').value;
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/income-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_IncomeStatement(apiUrl, displayIncomeStatement, 'incomeStatementContainerHK', 'incomeStatementChartHK', 'operatingChartHK', period);
}

function fetchCNIncomeStatement() {
    const stockSymbol = fetchCNStock();  // 获取中国股票代码
    const period = document.getElementById('periodCN').value;  // 获取选定的期间（年度或季度）
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/income-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_IncomeStatement(apiUrl, displayIncomeStatement, 'incomeStatementContainerCN', 'incomeStatementChartCN', 'operatingChartCN', period);
}

function fetchData_IncomeStatement(apiUrl, callback, containerId, chartId, operatingChartId, period) {
    const container = document.getElementById(containerId);
    container.innerHTML = '<p>Loading...</p>';
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data === undefined || !Array.isArray(data)) {
                container.innerHTML = '<p>Error loading data: Data is not an array or is undefined.</p>';
            } else {
                if (data.length > 0) {
                    callback(data, container, chartId, operatingChartId, period);

                    // 确保滚动条移动到最右边
                    setTimeout(() => {
                        const scrollContainer = document.getElementById(containerId).querySelector('.scroll-container-x');
                        scrollContainer.scrollLeft = scrollContainer.scrollWidth - scrollContainer.clientWidth;

                        // 再次确认是否滚动到最右边
                        if (scrollContainer.scrollLeft < scrollContainer.scrollWidth - scrollContainer.clientWidth) {
                            scrollContainer.scrollLeft = scrollContainer.scrollWidth;
                        }
                    }, 300); // 延长等待时间以确保元素完全渲染
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

function displayIncomeStatement(data, container, chartId, operatingChartId, period) {
    const yearRange = parseInt(document.getElementById('yearRange').value);
    const currentYear = new Date().getFullYear();

    // 過濾數據根據年份範圍
    const filteredData = data.filter(entry => {
        const entryYear = parseInt(entry.calendarYear);
        return yearRange === 'all' || (currentYear - entryYear < yearRange);
    });

    if (!data || !Array.isArray(data) || data.length === 0) {
        container.innerHTML = '<p>Data not available.</p>';
        const expandButton = document.getElementById('expandButton_Income');
        if (expandButton) expandButton.style.display = 'none';
        const collapseButton = document.getElementById('collapseButton_Income');
        if (collapseButton) collapseButton.style.display = 'none';
        return;
    }

    // 按日期升序排序
    data.sort((a, b) => new Date(a.date) - new Date(b.date));

    let rows = {
        date: ['Date'],
        symbol: ['Symbol'],
        reportedCurrency: ['Reported Currency'],
        cik: ['CIK'],
        fillingDate: ['Filling Date'],
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
        growthRate: [period === 'annual' ? 'YoY Growth' : 'YoY Growth']
    };

    // 填充行數據並計算增長率
    data.forEach((entry, index) => {
        rows.date.push(entry.date || 'N/A');
        rows.symbol.push(entry.symbol || 'N/A');
        rows.reportedCurrency.push(entry.reportedCurrency || 'N/A');
        rows.cik.push(entry.cik || 'N/A');
        rows.fillingDate.push(entry.fillingDate || 'N/A');
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

        // 計算增長率
        if (index > 0) {
            if (period === 'annual') {
                let lastRevenue = data[index - 1].revenue;
                if (entry.revenue && lastRevenue) {
                    let growthRate = ((entry.revenue - lastRevenue) / lastRevenue) * 100;
                    rows.growthRate.push(parseFloat(growthRate.toFixed(2)));
                } else {
                    rows.growthRate.push('N/A');
                }
            } else {
                // 查找去年同季度的數據
                let previousYearSameQuarterIndex = data.findIndex(e => e.calendarYear === (entry.calendarYear - 1).toString() && e.period === entry.period);
                if (previousYearSameQuarterIndex !== -1) {
                    let lastRevenue = data[previousYearSameQuarterIndex].revenue;
                    if (entry.revenue && lastRevenue) {
                        let growthRate = ((entry.revenue - lastRevenue) / lastRevenue) * 100;
                        rows.growthRate.push(parseFloat(growthRate.toFixed(2)));
                    } else {
                        rows.growthRate.push('N/A');
                    }
                } else {
                    rows.growthRate.push('N/A');
                }
            }
        } else {
            rows.growthRate.push('N/A');
        }
    });

    // 構建 HTML 表格
    let tableHtml = `
    <div style="display: flex; overflow-x: auto;">
        <div style="flex-shrink: 0; background: #1e1e1e; z-index: 1; border-right: 1px solid #000;">
            <table border="1" style="border-collapse: collapse;">
                ${Object.keys(rows).map(key => `<tr><th>${rows[key][0]}</th></tr>`).join('')}
            </table>
        </div>
        <div class="scroll-right" style="overflow-x: auto;">
            <table border="1" style="width: 100%; border-collapse: collapse;">
                ${Object.keys(rows).map(key => `<tr>${rows[key].slice(1).map(value => `<td>${value}</td>`).join('')}</tr>`).join('')}
            </table>
        </div>
    </div>
    `;

    // 創建容器結構
    container.innerHTML = `
        <div class="scroll-container-x" id="${chartId}ScrollContainer">
            <div id="${chartId}Container">
                ${tableHtml}
            </div>
        </div>
        <div id="operatingChartContainer" style="margin-top: 20px;">
            <canvas id="${operatingChartId}"></canvas>
        </div>
        <div id="chartContainer" style="margin-top: 20px;">
            <canvas id="${chartId}"></canvas>
        </div>
    `;

    // 設置scroll位置
    setTimeout(() => {
        const scrollContainer = document.getElementById(`${chartId}ScrollContainer`);
        if (scrollContainer) {
            scrollContainer.scrollLeft = scrollContainer.scrollWidth;

            // 再次確認是否滾動到最右邊
            if (scrollContainer.scrollLeft < scrollContainer.scrollWidth - scrollContainer.clientWidth) {
                scrollContainer.scrollLeft = scrollContainer.scrollWidth;
            }
        }
    }, 100);

    // 創建圖表
    createOperatingChart(data, operatingChartId);
    createIncomeStatementChart(data, chartId);

    const expandButton = document.getElementById('expandButton_Income');
    if (expandButton) expandButton.style.display = 'inline'; // 顯示 Read More 按鈕
}

function updateDisplayedYears() {
    const yearRange = parseInt(document.getElementById('yearRange').value);
    const currentYear = new Date().getFullYear();
    const filteredData = data.filter(entry => {
        const entryYear = parseInt(entry.calendarYear);
        return currentYear - entryYear < yearRange;
    });
    displayIncomeStatement(filteredData, container, chartId, operatingChartId, period);
}

function createOperatingChart(data, chartId) {
    // 首先，按日期從舊到新排序數據
    data.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 計算增長率
    data.forEach((entry, index) => {
        if (index > 0) {
            // 查找去年同季度的數據
            let previousYearSameQuarterIndex = data.findIndex(e => e.calendarYear === (entry.calendarYear - 1).toString() && e.period === entry.period);
            if (previousYearSameQuarterIndex !== -1) {
                let lastRevenue = data[previousYearSameQuarterIndex].revenue;
                if (entry.revenue && lastRevenue) {
                    let growthRate = ((entry.revenue - lastRevenue) / lastRevenue) * 100;
                    entry.growthRate = parseFloat(growthRate.toFixed(2)); // 確保為數字格式
                } else {
                    entry.growthRate = 'N/A';
                }
            } else {
                entry.growthRate = 'N/A';
            }
        } else {
            entry.growthRate = 'N/A';
        }
    });

    const ctx = document.getElementById(chartId).getContext('2d');

    // 銷毀現有圖表實例（如果存在）
    if (incomeStatementChartInstances[chartId]) {
        incomeStatementChartInstances[chartId].destroy();
    }

    incomeStatementChartInstances[chartId] = new Chart(ctx, {
        type: 'bar', // 主要圖表類型設為柱狀圖
        data: {
            labels: data.map(entry => entry.date),
            datasets: [
                {
                    label: 'Revenue',
                    data: data.map(entry => entry.revenue),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.6)', // 增加不透明度，使顏色更加鮮明
                    yAxisID: 'y'
                },
                {
                    label: 'Cost of Revenue',
                    data: data.map(entry => entry.costOfRevenue),
                    borderColor: 'rgba(153, 102, 255, 1)',
                    backgroundColor: 'rgba(153, 102, 255, 0.6)', // 增加不透明度，使顏色更加鮮明
                    yAxisID: 'y'
                },
                {
                    label: 'Operating Expenses',
                    data: data.map(entry => entry.operatingExpenses),
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.6)', // 增加不透明度，使顏色更加鮮明
                    yAxisID: 'y'
                },
                {
                    label: 'Operating Income',
                    data: data.map(entry => entry.operatingIncome),
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.6)', // 增加不透明度，使顏色更加鮮明
                    yAxisID: 'y'
                },
                {
                    label: 'Growth Rate',
                    data: data.map(entry => entry.growthRate),
                    type: 'line', // 單獨設置為折線圖
                    borderColor: 'rgba(255, 159, 64, 1)',
                    backgroundColor: 'rgba(255, 159, 64, 0.6)', // 增加不透明度，使顏色更加鮮明
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    },
                    reverse: false // 確保x軸不是反轉的
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Value'
                    },
                    position: 'left'
                },
                y1: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Growth Rate (%)'
                    },
                    position: 'right',
                    grid: {
                        drawOnChartArea: false // 仅绘制 y1 网格
                    }
                }
            }
        }
    });
}

function createIncomeStatementChart(data, chartId) {
    // 首先，按日期從舊到新排序數據
    data.sort((a, b) => new Date(a.date) - new Date(b.date));

    const ctx = document.getElementById(chartId).getContext('2d');

    // 銷毀現有圖表實例（如果存在）
    if (incomeStatementChartInstances[chartId]) {
        incomeStatementChartInstances[chartId].destroy();
    }

    incomeStatementChartInstances[chartId] = new Chart(ctx, {
        data: {
            labels: data.map(entry => entry.date),
            datasets: [
                {
                    type: 'bar',
                    label: 'EPS',
                    data: data.map(entry => entry.eps),
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    yAxisID: 'y'
                },
                {
                    type: 'line',
                    label: 'Gross Profit Ratio',
                    data: data.map(entry => entry.grossProfitRatio * 100),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    yAxisID: 'y1'
                },
                {
                    type: 'line',
                    label: 'Operating Income Ratio',
                    data: data.map(entry => entry.operatingIncomeRatio * 100),
                    borderColor: 'rgba(153, 102, 255, 1)',
                    backgroundColor: 'rgba(153, 102, 255, 0.6)',
                    yAxisID: 'y1'
                },
                {
                    type: 'line',
                    label: 'Net Income Ratio',
                    data: data.map(entry => entry.netIncomeRatio * 100),
                    borderColor: 'rgba(255, 159, 64, 1)',
                    backgroundColor: 'rgba(255, 159, 64, 0.6)',
                    yAxisID: 'y1'
                }

            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    },
                    reverse: false // 確保x軸不是反轉的
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Value'
                    },
                    position: 'left'
                },
                y1: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Percentage (%)'
                    },
                    position: 'right',
                    grid: {
                        drawOnChartArea: false // 仅绘制 y1 网格
                    }
                }
            }
        }
    });
}

function formatNumber(value) {
    // Check if the value is numeric and format it, otherwise return 'N/A'
    return value != null && !isNaN(value) ? parseFloat(value).toLocaleString('en-US') : 'N/A';
}

//////////////////////////////////////////////////資產負債表Balance Sheet Statements////////////////////////////////
let balanceSheetChartInstances = {}; // 用於存儲不同國家的圖表實例

function fetchBalanceSheet() {
    const stockSymbol = fetchStock();
    const period = document.getElementById('period_2').value;
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_BalanceSheet(apiUrl, displayBalanceSheet, 'balanceSheetContainer', 'balanceSheetChartUS');
}

function fetchJPBalanceSheet() {
    const stockSymbol = fetchJPStock();
    const period = document.getElementById('periodJP_2').value;
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_BalanceSheet(apiUrl, displayBalanceSheet, 'balanceSheetContainerJP', 'balanceSheetChartJP');
}

async function fetchTWBalanceSheet() {
    const stockSymbol = await fetchTWStock();
    const period = document.getElementById('periodTW_2').value;
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_BalanceSheet(apiUrl, displayBalanceSheet, 'balanceSheetContainerTW', 'balanceSheetChartTW');
}

function fetchEUBalanceSheet() {
    const stockSymbol = fetchEUStock();
    const period = document.getElementById('period_2EU').value;
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_BalanceSheet(apiUrl, displayBalanceSheet, 'balanceSheetContainerEU', 'balanceSheetChartEU');
}

function fetchKRBalanceSheet() {
    const stockSymbol = fetchKRStock();
    const period = document.getElementById('period_2KR').value;
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_BalanceSheet(apiUrl, displayBalanceSheet, 'balanceSheetContainerKR', 'balanceSheetChartKR');
}

function fetchHKBalanceSheet() {
    const stockSymbol = fetchHKStock();
    const period = document.getElementById('period_2HK').value;
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_BalanceSheet(apiUrl, displayBalanceSheet, 'balanceSheetContainerHK', 'balanceSheetChartHK');
}

function fetchCNBalanceSheet() {
    const stockSymbol = fetchCNStock();  // 获取中国股票代码
    const period = document.getElementById('period_2CN').value;  // 获取选定的期间（年度或季度）
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_BalanceSheet(apiUrl, displayBalanceSheet, 'balanceSheetContainerCN', 'balanceSheetChartCN');
}

function fetchData_BalanceSheet(apiUrl, callback, containerId, chartId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '<p>Loading...</p>';
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data === undefined || !Array.isArray(data)) {
                container.innerHTML = '<p>Error loading data: Data is not an array or is undefined.</p>';
            } else {
                if (data.length > 0) {
                    callback(data, container, chartId);
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

function displayBalanceSheet(data, container, chartId) {
    if (!data || !Array.isArray(data) || data.length === 0) {
        container.innerHTML = '<p>Data not available.</p>';
        return;
    }

    data.sort((a, b) => new Date(a.date) - new Date(b.date));

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
        // link: ['Report Link'],
        // finalLink: ['Final Link'],
        debtToAssetRate: ['Debt to Asset Rate']
    };

    data.forEach((entry) => {
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
        // rows.link.push(`<a class="styled-link" href="${entry.link}" target="_blank">View Report</a>`);
        // rows.finalLink.push(`<a class="styled-link" href="${entry.finalLink}" target="_blank">Final Report</a>`);
        let totalLiabilities = entry.totalLiabilities || 0;
        let totalAssets = entry.totalAssets || 0;
        let debtToAssetRate = totalAssets ? (totalLiabilities / totalAssets) : 0;
        rows.debtToAssetRate.push((debtToAssetRate * 100).toFixed(2) + '%');

        entry.debtToAssetRateValue = debtToAssetRate * 100;
    });

    let tableHtml = `
    <div style="display: flex; overflow-x: auto;">
        <div style="flex-shrink: 0; background: #1e1e1e; z-index: 1; border-right: 1px solid #000;">
            <table border="1" style="border-collapse: collapse; white-space: nowrap;">
                ${Object.keys(rows).map(key => `<tr><th>${rows[key][0]}</th></tr>`).join('')}
            </table>
        </div>
        <div class="scroll-right" style="overflow-x: auto;">
            <table border="1" style="width: 100%; border-collapse: collapse; white-space: nowrap;">
                ${Object.keys(rows).map(key => `<tr>${rows[key].slice(1).map(value => `<td>${value}</td>`).join('')}</tr>`).join('')}
            </table>
        </div>
    </div>
    `;

    // 更新容器结构
    container.innerHTML = `
        <div class="scroll-container-x" id="${chartId}ScrollContainer">
            <div id="${chartId}Container">
                ${tableHtml}
            </div>
        </div>
        <div id="chartContainer" style="margin-top: 20px;">
            <canvas id="${chartId}"></canvas>
        </div>
    `;

    setTimeout(() => {
        const canvas = document.getElementById(chartId);
        if (canvas && canvas instanceof HTMLCanvasElement) {
            createCombinedBalanceSheetChart(data, chartId);
        } else {
            console.error(`Canvas element with id ${chartId} not found or is not a canvas element.`);
            // 嘗試重新創建 canvas 元素
            const container = document.getElementById('chartContainer');
            if (container) {
                container.innerHTML = `<canvas id="${chartId}"></canvas>`;
                const newCanvas = document.getElementById(chartId);
                if (newCanvas && newCanvas instanceof HTMLCanvasElement) {
                    createCombinedBalanceSheetChart(data, chartId);
                } else {
                    console.error(`Failed to create canvas element with id ${chartId}.`);
                }
            }
        }
    }, 500);
}

function createCombinedBalanceSheetChart(data, chartId) {
    const canvas = document.getElementById(chartId);

    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
        console.error(`Canvas element with id ${chartId} not found or is not a canvas element.`);
        return;
    }

    const ctx = canvas.getContext('2d');

    // 銷毀現有圖表實例（如果存在）
    if (balanceSheetChartInstances[chartId]) {
        balanceSheetChartInstances[chartId].destroy();
    }

    balanceSheetChartInstances[chartId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(entry => entry.date),
            datasets: [
                {
                    label: 'Total Assets',
                    data: data.map(entry => entry.totalAssets),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    yAxisID: 'y'
                },
                {
                    label: 'Total Liabilities',
                    data: data.map(entry => entry.totalLiabilities),
                    borderColor: 'rgba(153, 102, 255, 1)',
                    backgroundColor: 'rgba(153, 102, 255, 0.6)',
                    yAxisID: 'y'
                },
                {
                    label: 'Total Equity',
                    data: data.map(entry => entry.totalEquity),
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    yAxisID: 'y'
                },
                {
                    label: 'Debt to Asset Rate',
                    data: data.map(entry => entry.debtToAssetRateValue), // 使用數值數據
                    type: 'line',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    },
                    reverse: false
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Value'
                    },
                    position: 'left'
                },
                y1: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Percentage (%)'
                    },
                    position: 'right',
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

function formatNumber(value) {
    return value != null && !isNaN(value) ? parseFloat(value).toLocaleString('en-US') : 'N/A';
}


///////////////////////////////////現金流表Cashflow///////////////
let cashflowChartInstances = {}; // 用於存儲不同國家的圖表實例

function fetchCashflow() {
    const stockSymbol = fetchStock();
    const period = document.getElementById('period_3').value;
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/cash-flow-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_Cashflow(apiUrl, data => displayCashflow(data, 'cashflowContainer', 'cashflowChartUS'));
}

function fetchJPCashflow() {
    const stockSymbol = fetchJPStock();
    const period = document.getElementById('periodJP_3').value;
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/cash-flow-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_Cashflow(apiUrl, data => displayCashflow(data, 'cashflowContainerJP', 'cashflowChartJP'));
}

async function fetchTWCashflow() {
    const stockSymbol = await fetchTWStock();
    const period = document.getElementById('periodTW_3').value;
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/cash-flow-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_Cashflow(apiUrl, data => displayCashflow(data, 'cashflowContainerTW', 'cashflowChartTW'));
}

function fetchEUCashflow() {
    const stockSymbol = fetchEUStock();
    const period = document.getElementById('period_3EU').value;
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/cash-flow-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_Cashflow(apiUrl, data => displayCashflow(data, 'cashflowContainerEU', 'cashflowChartEU'));
}

function fetchKRCashflow() {
    const stockSymbol = fetchKRStock();
    const period = document.getElementById('period_3KR').value;
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/cash-flow-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_Cashflow(apiUrl, data => displayCashflow(data, 'cashflowContainerKR', 'cashflowChartKR'));
}

function fetchHKCashflow() {
    const stockSymbol = fetchHKStock();
    const period = document.getElementById('period_3HK').value;
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/cash-flow-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_Cashflow(apiUrl, data => displayCashflow(data, 'cashflowContainerHK', 'cashflowChartHK'));
}

function fetchCNCashflow() {
    const stockSymbol = fetchCNStock();  // 获取中国股票代码
    const period = document.getElementById('period_3CN').value;  // 获取选定的期间（年度或季度）
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/cash-flow-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_Cashflow(apiUrl, data => displayCashflow(data, 'cashflowContainerCN', 'cashflowChartCN'));
}

function fetchData_Cashflow(apiUrl, callback) {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data === undefined || !Array.isArray(data)) {
                console.error('Error loading data: Data is not an array or is undefined.');
            } else if (data.length > 0) {
                callback(data);
            } else {
                console.error('No data found for this symbol.');
            }
        })
        .catch(error => {
            console.error('Error fetching data: ', error);
        });
}

function displayCashflow(data, containerId, chartId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container element with id ${containerId} not found.`);
        return;
    }

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
        // link: ['Report Link'],
        // finalLink: ['Final Link'],
        capexToOperatingCashFlow: ['Capex to Operating Cash Flow']
    };

    // 按日期升序排序
    data.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 填充行數據
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
        // rows.link.push(`<a class="styled-link" href="${entry.link}" target="_blank">View Report</a>`);
        // rows.finalLink.push(`<a class="styled-link" href="${entry.finalLink}" target="_blank">Final Report</a>`);

        // 計算 Capex to Operating Cash Flow
        let capex = entry.capitalExpenditure || 0;
        let operatingCashFlow = entry.operatingCashFlow || 0;
        let capexToOperatingCashFlow = operatingCashFlow !== 0 ? Math.abs(capex / operatingCashFlow) * 100 : 0;
        rows.capexToOperatingCashFlow.push((capexToOperatingCashFlow || 0).toFixed(2) + '%');

        // 保存數值版本以供圖表使用
        entry.capexToOperatingCashFlowValue = capexToOperatingCashFlow;

    });

    // 構建 HTML 表格
    let tableHtml = `
    <div style="display: flex; overflow-x: auto;">
        <div style="flex-shrink: 0; background: #1e1e1e; z-index: 1; border-right: 1px solid #000;">
            <table border="1" style="border-collapse: collapse; white-space: nowrap;">
                ${Object.keys(rows).map(key => `<tr><th>${rows[key][0]}</th></tr>`).join('')}
            </table>
        </div>
        <div class="scroll-right" style="overflow-x: auto;">
            <table border="1" style="width: 100%; border-collapse: collapse; white-space: nowrap;">
                ${Object.keys(rows).map(key => `<tr>${rows[key].slice(1).map(value => `<td>${value}</td>`).join('')}</tr>`).join('')}
            </table>
        </div>
    </div>
    `;

    // 創建容器結構
    container.innerHTML = `
        <div class="scroll-container-x" id="${chartId}ScrollContainer">
            <div id="${chartId}Container">
                ${tableHtml}
            </div>
        </div>
        <div id="cashflowChartContainer" style="margin-top: 20px;">
            <canvas id="${chartId}"></canvas>
        </div>
    `;

    // 設置scroll位置
    setTimeout(() => {
        const scrollContainer = document.getElementById(`${chartId}ScrollContainer`);
        if (scrollContainer) {
            scrollContainer.scrollLeft = scrollContainer.scrollWidth;

            // 再次確認是否滾動到最右邊
            if (scrollContainer.scrollLeft < scrollContainer.scrollWidth - scrollContainer.clientWidth) {
                scrollContainer.scrollLeft = scrollContainer.scrollWidth;
            }
        }
    }, 100);

    // 繪製圖表
    createCashflowChart(data, chartId);
}

function createCashflowChart(data, chartId) {
    const canvas = document.getElementById(chartId);

    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
        console.error(`Canvas element with id ${chartId} not found or is not a canvas element.`);
        return;
    }

    const ctx = canvas.getContext('2d');

    // 銷毀現有圖表實例（如果存在）
    if (cashflowChartInstances[chartId]) {
        cashflowChartInstances[chartId].destroy();
    }

    cashflowChartInstances[chartId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(entry => entry.date),
            datasets: [
                {
                    label: 'Operating Cash Flow',
                    data: data.map(entry => entry.operatingCashFlow),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    yAxisID: 'y'
                },
                {
                    label: 'Capital Expenditure',
                    data: data.map(entry => entry.capitalExpenditure),
                    borderColor: 'rgba(153, 102, 255, 1)',
                    backgroundColor: 'rgba(153, 102, 255, 0.6)',
                    yAxisID: 'y'
                },
                {
                    label: 'Free Cash Flow',
                    data: data.map(entry => entry.freeCashFlow),
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    yAxisID: 'y'
                },
                {
                    label: 'Capex to Operating Cash Flow',
                    data: data.map(entry => entry.capexToOperatingCashFlowValue), // 使用數值數據
                    type: 'line',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Value'
                    },
                    position: 'left'
                },
                y1: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Percentage (%)'
                    },
                    position: 'right',
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
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

function fetchJPEarningsCallTranscript() {
    var stockSymbol = fetchJPStock();
    const year = document.getElementById('yearInputJP').value;
    const quarter = document.getElementById('quarterInputJP').value;
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';  // 替換為你的實際 API 密鑰

    if (stockSymbol.length === 0 || year.length === 0 || quarter.length === 0) {
        alert('請輸入股票代碼、年份及季度。');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/earning_call_transcript/${stockSymbol}?year=${year}&quarter=${quarter}&apikey=${apiKey}`;
    fetchData_Transcript(apiUrl, displayEarningsCallTranscript, 'earningsCallTranscriptContainerJP');
}

function fetchEUEarningsCallTranscript() {
    const stockSymbol = fetchEUStock();
    const year = document.getElementById('yearInputEU').value;
    const quarter = document.getElementById('quarterInputEU').value;
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';  // 替換為你的實際 API 密鑰

    if (stockSymbol.length === 0 || year.length === 0 || quarter.length === 0) {
        alert('請輸入股票代碼、年份及季度。');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/earning_call_transcript/${stockSymbol}?year=${year}&quarter=${quarter}&apikey=${apiKey}`;
    fetchData_Transcript(apiUrl, displayEarningsCallTranscript, 'earningsCallTranscriptContainerEU');
}

function fetchKREarningsCallTranscript() {
    const stockSymbol = fetchKRStock();
    const year = document.getElementById('yearInputKR').value;
    const quarter = document.getElementById('quarterInputKR').value;
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';  // 替換為你的實際 API 密鑰

    if (stockSymbol.length === 0 || year.length === 0 || quarter.length === 0) {
        alert('請輸入股票代碼、年份及季度。');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/earning_call_transcript/${stockSymbol}?year=${year}&quarter=${quarter}&apikey=${apiKey}`;
    fetchData_Transcript(apiUrl, displayEarningsCallTranscript, 'earningsCallTranscriptContainerKR');
}

async function fetchTWEarningsCallTranscript() {
    const stockSymbol = await fetchTWStock(); // 獲取台股代碼
    const year = document.getElementById('yearInputTW').value;
    const quarter = document.getElementById('quarterInputTW').value;
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';  // 替換為你的實際 API 密鑰

    if (stockSymbol.length === 0 || year.length === 0 || quarter.length === 0) {
        alert('請輸入股票代碼、年份及季度。');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/earning_call_transcript/${stockSymbol}?year=${year}&quarter=${quarter}&apikey=${apiKey}`;
    fetchData_Transcript(apiUrl, displayEarningsCallTranscript, 'earningsCallTranscriptContainerTW');
}


function fetchHKEarningsCallTranscript() {
    const stockSymbol = fetchHKStock();
    const year = document.getElementById('yearInputHK').value;
    const quarter = document.getElementById('quarterInputHK').value;
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';  // 替換為你的實際 API 密鑰

    if (stockSymbol.length === 0 || year.length === 0 || quarter.length === 0) {
        alert('請輸入股票代碼、年份及季度。');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/earning_call_transcript/${stockSymbol}?year=${year}&quarter=${quarter}&apikey=${apiKey}`;
    fetchData_Transcript(apiUrl, displayEarningsCallTranscript, 'earningsCallTranscriptContainerHK');
}

function fetchCNEarningsCallTranscript() {
    const stockSymbol = fetchCNStock();  // 获取中国股票代码
    const year = document.getElementById('yearInputCN').value;  // 获取用户输入的年份
    const quarter = document.getElementById('quarterInputCN').value;  // 获取用户输入的季度
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';  // 替換為你的实际 API 密钥

    if (stockSymbol.length === 0 || year.length === 0 || quarter.length === 0) {
        alert('请输入股票代码、年份及季度。');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/earning_call_transcript/${stockSymbol}?year=${year}&quarter=${quarter}&apikey=${apiKey}`;
    fetchData_Transcript(apiUrl, displayEarningsCallTranscript, 'earningsCallTranscriptContainerCN');
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

function fetchJPEarningsCallCalendar() {
    const fromDate = document.getElementById('fromDateJP').value;
    const toDate = document.getElementById('toDateJP').value;
    stockSymbol = fetchJPStock();
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';  // 替換為你的實際 API 密鑰
    if (!fromDate || !toDate) {
        alert('請輸入開始和結束日期。');
        return;
    }
    const apiUrl = `https://financialmodelingprep.com/api/v3/earning_calendar?from=${fromDate}&to=${toDate}&apikey=${apiKey}`;
    fetchData_2(apiUrl, (data) => displayEarningsCallCalendar_JP(data, 'earningsCallCalendarContainerJP', stockSymbol), 'earningsCallCalendarContainerJP');
}

async function fetchTWEarningsCallCalendar() {
    const fromDate = document.getElementById('fromDateTW').value;
    const toDate = document.getElementById('toDateTW').value;
    const stockSymbol = await fetchTWStock(); // 獲取台股代碼
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';  // 替換為你的實際 API 密鑰

    if (!fromDate || !toDate) {
        alert('請輸入開始和結束日期。');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/earning_calendar?from=${fromDate}&to=${toDate}&apikey=${apiKey}`;
    fetchData_2(apiUrl, (data) => displayEarningsCallCalendar(data, 'earningsCallCalendarContainerTW', stockSymbol), 'earningsCallCalendarContainerTW');
}


function fetchEUEarningsCallCalendar() {
    const fromDate = document.getElementById('fromDateEU').value;
    const toDate = document.getElementById('toDateEU').value;
    const stockSymbol = fetchEUStock();
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';  // 替換為你的實際 API 密鑰

    if (!fromDate || !toDate) {
        alert('請輸入開始和結束日期。');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/earning_calendar?from=${fromDate}&to=${toDate}&apikey=${apiKey}`;
    fetchData_2(apiUrl, (data) => displayEarningsCallCalendar(data, 'earningsCallCalendarContainerEU', stockSymbol), 'earningsCallCalendarContainerEU');
}

function fetchKREarningsCallCalendar() {
    const fromDate = document.getElementById('fromDateKR').value;
    const toDate = document.getElementById('toDateKR').value;
    const stockSymbol = fetchKRStock();
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';  // 替換為你的實際 API 密鑰

    if (!fromDate || !toDate) {
        alert('請輸入開始和結束日期。');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/earning_calendar?from=${fromDate}&to=${toDate}&apikey=${apiKey}`;
    fetchData_2(apiUrl, (data) => displayEarningsCallCalendar(data, 'earningsCallCalendarContainerKR', stockSymbol), 'earningsCallCalendarContainerKR');
}

function fetchHKEarningsCallCalendar() {
    const fromDate = document.getElementById('fromDateHK').value;
    const toDate = document.getElementById('toDateHK').value;
    const stockSymbol = fetchHKStock();
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';  // 替換為你的實際 API 密鑰

    if (!fromDate || !toDate) {
        alert('請輸入開始和結束日期。');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/earning_calendar?from=${fromDate}&to=${toDate}&apikey=${apiKey}`;
    fetchData_2(apiUrl, (data) => displayEarningsCallCalendar(data, 'earningsCallCalendarContainerHK', stockSymbol), 'earningsCallCalendarContainerHK');
}

function fetchCNEarningsCallCalendar() {
    const fromDate = document.getElementById('fromDateCN').value;
    const toDate = document.getElementById('toDateCN').value;
    const stockSymbol = fetchCNStock();  // 获取中国股票代码
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';  // 替換為你的实际 API 密钥

    if (!fromDate || !toDate) {
        alert('请输入开始和结束日期。');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/earning_calendar?from=${fromDate}&to=${toDate}&apikey=${apiKey}`;
    fetchData_2(apiUrl, (data) => displayEarningsCallCalendar(data, 'earningsCallCalendarContainerCN', stockSymbol), 'earningsCallCalendarContainerCN');
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

function displayEarningsCallCalendar_JP(data, containerId, stockSymbol) {
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
    console.log(container); // Add this line
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

function fetchJPHistoricalEarnings() {
    stockSymbol = fetchJPStock();
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf'; // 替換為你的實際 API 密鑰
    if (!stockSymbol) {
        alert('請輸入股票代碼。');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/historical/earning_calendar/${stockSymbol}?apikey=${apiKey}`;
    fetchData_historical_earning_calendar(apiUrl, display_historical_earning_calendar_JP, 'historicalEarningsContainerJP');
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

function display_historical_earning_calendar_JP(data, container) {
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

function fetchJPStockDividendCalendar() {
    const fromDate = document.getElementById('fromDate_2-JP').value;
    const toDate = document.getElementById('toDate_2-JP').value;
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf'; // 替換為你的實際 API 密鑰
    if (!fromDate || !toDate) {
        alert('請輸入起始日期和結束日期。');
        return;
    }
    const apiUrl = `https://financialmodelingprep.com/api/v3/stock_dividend_calendar?from=${fromDate}&to=${toDate}&apikey=${apiKey}`;
    fetchData_2(apiUrl, display_stock_dividend_calendar_JP, 'stockDividendCalendarContainerJP');
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

function display_stock_dividend_calendar_JP(data, container) {
    stockSymbol = fetchJPStock();
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

function fetchJPInsiderTrades() {
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf'; // 替換為你的 API 密鑰
    stockSymbol = fetchJPStock();
    const apiUrl = `https://financialmodelingprep.com/api/v4/insider-trading?symbol=${stockSymbol}&page=0&apikey=${apiKey}`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const container = document.getElementById('insiderTradesContainerJP');
            displayInsiderTrades_JP(data, container);
        })
        .catch(error => {
            console.error('Error fetching data: ', error);
            const container = document.getElementById('insiderTradesContainerJP');
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
        rows.link.push(item.link ? `<a  class="styled-link" href="${item.link}" target="_blank">View Form</a>` : 'N/A');
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

function displayInsiderTrades_JP(data, container) {
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
        rows.link.push(item.link ? `<a class="styled-link" href="${item.link}" target="_blank">View Form</a>` : 'N/A');
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

    const buttonContainer = document.getElementById('buttonContainer');
    buttonContainer.style.display = 'none';

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
    const buttonContainer = document.getElementById('buttonContainer');
    const readMoreBtn = document.getElementById('readMoreBtn');
    const readLessBtn = document.getElementById('readLessBtn');
    const copyBtn = document.getElementById('copyBtn');

    container.innerHTML = '';

    if (data.text) {
        const transcriptionText = data.text.replace(/\n/g, '<br>');
        container.innerHTML = `<p>${transcriptionText}</p>`;

        copyBtn.onclick = function() {
            copyToClipboard(data.text);
        };

        // 显示按钮容器
        buttonContainer.style.display = 'flex';

        // 检查文本高度以确定是否需要显示 "Read More" 或 "Read Less" 按钮
        if (container.scrollHeight > 200) {
            readMoreBtn.classList.remove('hidden');
            readLessBtn.classList.add('hidden');
        } else {
            readMoreBtn.classList.add('hidden');
            readLessBtn.classList.add('hidden');
        }
    } else {
        container.innerHTML = '<p>No transcription content</p>';
        buttonContainer.style.display = 'none';  // 没有文本时隐藏按钮
    }

    document.getElementById('transcription-progress-container').style.display = 'none';
    showAlert('Transcription completed');
}

function toggleReadMore() {
    const container = document.getElementById('transcriptionResult');
    const readMoreBtn = document.getElementById('readMoreBtn');
    const readLessBtn = document.getElementById('readLessBtn');

    if (readMoreBtn.classList.contains('hidden')) {
        container.style.maxHeight = '200px';  // 设置最大高度以便显示 "Read More"
        readMoreBtn.classList.remove('hidden');
        readLessBtn.classList.add('hidden');
    } else {
        container.style.maxHeight = 'none';  // 移除最大高度限制以显示全部文本
        readMoreBtn.classList.add('hidden');
        readLessBtn.classList.remove('hidden');
    }
}

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        showAlert('Text copied to clipboard');
    } catch (err) {
        console.error('Failed to copy text', err);
        showAlert('Failed to copy text');
    }
    document.body.removeChild(textarea);
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
            // console.error('Error fetching queue length:', error);
        });
}