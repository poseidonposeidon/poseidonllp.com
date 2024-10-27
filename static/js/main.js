
//////////////////////////////////////////////////////////////////////////////
let activeSection = null;

function collapseSection(element) {
    const content = element.querySelector('.content');
    if (content && !element.classList.contains('fixed')) {
        content.style.maxHeight = '0px';
        content.style.opacity = '0';
        content.style.paddingTop = '0';
        content.style.paddingBottom = '0';
    }
}

function toggleSection(event, sectionId) {
    event.preventDefault();
    event.stopPropagation(); // 防止事件冒泡影響其他點擊事件

    const section = document.querySelector(sectionId);
    if (!section) {
        console.error('Section not found:', sectionId);
        return;
    }

    const overlay = document.querySelector('.overlay');
    const blurElements = document.querySelectorAll('body > *:not(.overlay):not(.navbar):not(.info-section):not(.ai-box-section):not(#compare)');

    if (activeSection && activeSection === section) {
        // 如果當前 activeSection 是被點擊的 section，那麼應該隱藏它
        hideSection(section);
        activeSection = null; // 將 activeSection 設置為 null
        overlay.classList.remove('active');
        document.body.classList.remove('modal-open');
        blurElements.forEach(el => el.classList.remove('blur-background'));
    } else {
        // 否則，關閉當前 activeSection 並顯示點擊的 section
        if (activeSection) {
            hideSection(activeSection); // 關閉當前的 activeSection
        }
        showSection(section); // 展開新的 section
        activeSection = section; // 將新展開的 section 設為 activeSection
        overlay.classList.add('active');
        document.body.classList.add('modal-open');
        blurElements.forEach(el => el.classList.add('blur-background'));
    }
}

function showSection(section) {
    section.style.display = 'block'; // 確保 section 顯示

    // 避免點擊 section 內部時觸發關閉行為
    section.addEventListener('click', (event) => {
        event.stopPropagation(); // 防止點擊時事件冒泡到 document
    });

    const content = section.querySelector('.content');
    if (content) {
        content.style.maxHeight = content.scrollHeight + 'px'; // 使用 scrollHeight 確保高度過渡
        content.style.opacity = '1';
        content.style.paddingTop = '';
        content.style.paddingBottom = '';
    }

    setTimeout(() => {
        section.classList.add('active');
        section.style.overflowY = 'auto'; // 確保展開後支援滾動
    }, 10);
}

function hideSection(section) {
    const content = section.querySelector('.content');
    if (content) {
        content.style.maxHeight = '0px'; // 設置最大高度為0，動畫隱藏
        content.style.opacity = '0';
        content.style.paddingTop = '0';
        content.style.paddingBottom = '0';
    }

    section.classList.remove('active');
    section.style.overflowY = 'hidden'; // 隱藏時移除滾動條

    // 使用 setTimeout 延遲隱藏，等待動畫結束
    setTimeout(() => {
        section.style.display = 'none'; // 動畫完成後隱藏 section
    }, 500); // 與 CSS 轉場時間匹配
}

// 當點擊 body 時，若點擊位置不在 activeSection 內，則收起 section
document.addEventListener('click', (event) => {
    // 如果沒有 activeSection，則不處理
    if (!activeSection) return;

    // 如果點擊事件發生在 activeSection 內部，則不處理
    if (activeSection.contains(event.target)) {
        return;
    }

    // 如果點擊不在 activeSection 內，則隱藏 activeSection
    hideSection(activeSection);
    activeSection = null;
    document.querySelector('.overlay').classList.remove('active');
    document.body.classList.remove('modal-open');
    document.querySelectorAll('body > *:not(.overlay):not(.navbar):not(.info-section):not(.ai-box-section):not(#compare)').forEach(el => el.classList.remove('blur-background'));
});

document.addEventListener('DOMContentLoaded', () => {
    // 只隱藏那些需要展開或動態載入的 sections
    document.querySelectorAll('#info-section, #ai_box, #jp-info-section, #tw-info-section, #eu-info-section, #kr-info-section, #hk-info-section, #cn-info-section, #compare').forEach(section => {
        section.style.display = 'none';
    });

    // 對於動態載入的 section，也進行預設隱藏
    const dynamicSections = document.querySelectorAll('#chat-gpt-section, #audio-transcription-section');
    dynamicSections.forEach(section => section.style.display = 'none');
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
                    <select id="yearRange" onchange="fetchIncomeStatement()">
<!--                        <option value="3">Last 3 Years</option>-->
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
                    <!-- 添加年份範圍選單 -->
                    <label for="yearRange_2">Select Year Range:</label>
                    <select id="yearRange_2" onchange="fetchBalanceSheet()">
                        <option value="5">Last 5 Years</option>
                        <option value="10">Last 10 Years</option>
                        <option value="all">All Years</option>
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
                    
                    <!-- 添加年份範圍選單 -->
                    <label for="yearRange_3">Select Year Range:</label>
                    <select id="yearRange_3" onchange="fetchCashflow()">
                        <option value="5">Last 5 Years</option>
                        <option value="10">Last 10 Years</option>
                        <option value="all">All Years</option>
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
                    
                       <div id="earningsCallCalendarContainer"></div>
                    
                </div>
            </div>`,
        'historical-earnings': `
            <div class="section" id="historical-earnings">
                <h2>Historical and Future Earnings</h2>
                <div class="content">
<!--                    <input type="date" id="fromDate_1" placeholder="From Date">-->
<!--                    <input type="date" id="toDate_1" placeholder="To Date">-->
                    <button onclick="fetch_historical_earning_calendar()">Load Calendar</button>
                    <div id="historicalEarningsContainer">
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
                    <div id="stockDividendCalendarContainer">
                        <!-- Data table will be displayed here -->
                    </div>
                </div>
            </div>`,
        'insider-trades': `
            <div class="section" id="insider-trades">
                <h2>Insider Trades</h2>
                <div class="content">
                    <button onclick="fetchInsiderTrades()">Load Table</button>
                    <div  id="insiderTradesContainer">
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
                    <label for="yearRangeJP">Select Year Range:</label>
                    <select id="yearRangeJP" onchange="fetchJPIncomeStatement()">
<!--                        <option value="3">Last 3 Years</option>-->
                        <option value="5">Last 5 Years</option>
                        <option value="10">Last 10 Years</option>
                        <option value="all">All Years</option>
                    </select>
                    
                    <button onclick="fetchJPIncomeStatement()">Load Statement</button>
                    <div id="incomeStatementContainerJP"></div>
                </div>
            </div>`,
        'balance-sheet': `
        <div class="section" id="balance-sheet">
            <h2>Balance Sheet Statements</h2>
            <div class="content scroll-container-x">
                <label for="periodJP_2">Select Period:</label>
                <select id="periodJP_2">
                    <option value="annual">Annual</option>
                    <option value="quarter">Quarter</option>
                </select>
                
                <!-- 添加年份範圍選單 -->
                <label for="yearRangeJP_2">Select Year Range:</label>
                <select id="yearRangeJP_2" onchange="fetchJPBalanceSheet()">
                    <option value="5">Last 5 Years</option>
                    <option value="10">Last 10 Years</option>
                    <option value="all">All Years</option>
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
                    
                    <!-- 添加年份範圍選單 -->
                    <label for="yearRangeJP_3">Select Year Range:</label>
                    <select id="yearRangeJP_3" onchange="fetchJPCashflow()">
                        <option value="5">Last 5 Years</option>
                        <option value="10">Last 10 Years</option>
                        <option value="all">All Years</option>
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
                    
                      <div id="earningsCallCalendarContainerJP"></div>
                    
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
                    
                    <label for="yearRangeTW">Select Year Range:</label>
                    <select id="yearRangeTW" onchange="fetchTWIncomeStatement()">
<!--                        <option value="3">Last 3 Years</option>-->
                        <option value="5">Last 5 Years</option>
                        <option value="10">Last 10 Years</option>
                        <option value="all">All Years</option>
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
                    
                    <!-- 添加年份範圍選單 -->
                    <label for="yearRangeTW_2">Select Year Range:</label>
                    <select id="yearRangeTW_2" onchange="fetchTWBalanceSheet()">
                        <option value="5">Last 5 Years</option>
                        <option value="10">Last 10 Years</option>
                        <option value="all">All Years</option>
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
                    
                    <!-- 添加年份範圍選單 -->
                    <label for="yearRangeTW_3">Select Year Range:</label>
                    <select id="yearRangeTW_3" onchange="fetchTWCashflow()">
                        <option value="5">Last 5 Years</option>
                        <option value="10">Last 10 Years</option>
                        <option value="all">All Years</option>
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
                    
                        <div id="earningsCallCalendarContainerTW"></div>
                    
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
                    
                    <label for="yearRangeEU">Select Year Range:</label>
                    <select id="yearRangeEU" onchange="fetchEUIncomeStatement()">
<!--                        <option value="3">Last 3 Years</option>-->
                        <option value="5">Last 5 Years</option>
                        <option value="10">Last 10 Years</option>
                        <option value="all">All Years</option>
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
                    
                    <!-- 添加年份範圍選單 -->
                    <label for="yearRangeEU_2">Select Year Range:</label>
                    <select id="yearRangeEU_2" onchange="fetchEUBalanceSheet()">
                        <option value="5">Last 5 Years</option>
                        <option value="10">Last 10 Years</option>
                        <option value="all">All Years</option>
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
                    
                    <!-- 添加年份範圍選單 -->
                    <label for="yearRangeEU_3">Select Year Range:</label>
                    <select id="yearRangeEU_3" onchange="fetchEUCashflow()">
                        <option value="5">Last 5 Years</option>
                        <option value="10">Last 10 Years</option>
                        <option value="all">All Years</option>
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
                    
                        <div id="earningsCallCalendarContainerEU"></div>
                    
                </div>
            </div>`,
        'historical-earnings': `
            <div class="section" id="historical-earnings-eu">
                <h2>Historical and Future Earnings</h2>
                <div class="content">
                    <input type="date" id="fromDate_1EU" placeholder="From Date">
                    <input type="date" id="toDate_1EU" placeholder="To Date">
                    <button onclick="fetchEUHistoricalEarnings()">Load Calendar</button>
                    <div  id="historicalEarningsContainerEU">
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

function loadSectionKR(sectionId)   {
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
                    
                    <label for="yearRangeKR">Select Year Range:</label>
                    <select id="yearRangeKR" onchange="fetchKRIncomeStatement()">
<!--                        <option value="3">Last 3 Years</option>-->
                        <option value="5">Last 5 Years</option>
                        <option value="10">Last 10 Years</option>
                        <option value="all">All Years</option>
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
                    
                    <!-- 添加年份範圍選單 -->
                    <label for="yearRangeKR_2">Select Year Range:</label>
                    <select id="yearRangeKR_2" onchange="fetchKRBalanceSheet()">
                        <option value="5">Last 5 Years</option>
                        <option value="10">Last 10 Years</option>
                        <option value="all">All Years</option>
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
                    
                    <!-- 添加年份範圍選單 -->
                    <label for="yearRangeKR_3">Select Year Range:</label>
                    <select id="yearRangeKR_3" onchange="fetchKRCashflow()">
                        <option value="5">Last 5 Years</option>
                        <option value="10">Last 10 Years</option>
                        <option value="all">All Years</option>
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
                    
                        <div id="earningsCallCalendarContainerKR"></div>
                    
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
                    
                    <label for="yearRangeHK">Select Year Range:</label>
                    <select id="yearRangeHK" onchange="fetchHKIncomeStatement()">
<!--                        <option value="3">Last 3 Years</option>-->
                        <option value="5">Last 5 Years</option>
                        <option value="10">Last 10 Years</option>
                        <option value="all">All Years</option>
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
                    
                    <!-- 添加年份範圍選單 -->
                    <label for="yearRangeHK_2">Select Year Range:</label>
                    <select id="yearRangeHK_2" onchange="fetchHKBalanceSheet()">
                        <option value="5">Last 5 Years</option>
                        <option value="10">Last 10 Years</option>
                        <option value="all">All Years</option>
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
                    
                    <!-- 添加年份範圍選單 -->
                    <label for="yearRangeHK_3">Select Year Range:</label>
                    <select id="yearRangeHK_3" onchange="fetchHKCashflow()">
                        <option value="5">Last 5 Years</option>
                        <option value="10">Last 10 Years</option>
                        <option value="all">All Years</option>
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
                    
                        <div id="earningsCallCalendarContainerHK"></div>
                    
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
                    
                    <label for="yearRangeCN">Select Year Range:</label>             
                    <select id="yearRangeCN" onchange="fetchCNIncomeStatement()">
<!--                        <option value="3">Last 3 Years</option>-->
                        <option value="5">Last 5 Years</option>
                        <option value="10">Last 10 Years</option>
                        <option value="all">All Years</option>
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
                    
                    <!-- 添加年份範圍選單 -->
                    <label for="yearRangeCN_2">Select Year Range:</label>
                    <select id="yearRangeCN_2" onchange="fetchCNBalanceSheet()">
                        <option value="5">Last 5 Years</option>
                        <option value="10">Last 10 Years</option>
                        <option value="all">All Years</option>
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
                    
                    <!-- 添加年份範圍選單 -->
                    <label for="yearRangeCN_3">Select Year Range:</label>
                    <select id="yearRangeCN_3" onchange="fetchCNCashflow()">
                        <option value="5">Last 5 Years</option>
                        <option value="10">Last 10 Years</option>
                        <option value="all">All Years</option>
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
                    
                        <div id="earningsCallCalendarContainerCN"></div>
                    
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
            </div>`,
        'chat-gpt': `
            <div class="section" id="chat-gpt-section">
                <h2>Chat GPT</h2>
                <div class="chat-container">
                    <div id="chat-box" class="chat-box">
                        <!-- 聊天訊息將顯示在這裡 -->
                    </div>
                    <div class="chat-input-container">
                        <textarea id="chat-input" rows="2" placeholder="Type your message here..."></textarea>
                        <button id="send-btn" onclick="sendMessage()">Send</button>
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

function loadCompareSection(sectionId) {
    const sections = {
        'compare-tw': `
            <h2>Compare Taiwan Stocks</h2>
            <div class="info-input">
                <label for="stock1-tw">Enter Stock 1 :</label>
                <input type="text" id="stock1-tw" placeholder="e.g., 2330">
                
                <label for="stock2-tw">Enter Stock 2 :</label>
                <input type="text" id="stock2-tw" placeholder="e.g., 2317">
                
<!--                <button onclick="compareTaiwanStocks()">Compare</button>-->
            </div>
            
            <!-- 新增切換圖表的功能 -->
            <div class="chart-links">
                <div class="category">
                    <span class="title" onclick="toggleMenu('financials')">Financial Report</span>
                    <div class="submenu" id="financials">
                        <a href="#" onclick="displayChart('stockPrice')">Stock Price</a>
                        <a href="#" onclick="displayChart('eps')">EPS</a>
                        <a href="#" onclick="displayChart('peRatio')">P/E Ratio</a>
                    </div>
                </div>
            
                <div class="category">
                    <span class="title" onclick="toggleMenu('profitability')">Profitability</span>
                    <div class="submenu" id="profitability">
                        <a href="#" onclick="displayChart('grossMargin')">Gross Margin</a>
                        <a href="#" onclick="displayChart('operatingMargin')">Operating Margin</a>
                        <a href="#" onclick="displayChart('netProfitMargin')">Net Profit Margin</a>
                        <a href="#" onclick="displayChart('roe')">ROE</a>
                        <a href="#" onclick="displayChart('externalROE')">External ROE</a>
                    </div>
                </div>
            
                <div class="category">
                    <span class="title" onclick="toggleMenu('growth')">Growth</span>
                    <div class="submenu" id="growth">
                            <a href="#" onclick="displayChart('quarterlyRevenueGrowthRate')">Revenue YoY</a>
<!--                            <a href="#" onclick="displayChart('revenueGrowthRate')">Gross Margin YoY</a>-->
<!--                            <a href="#" onclick="displayChart('operatingMarginGrowthRate')">Operating Margin YoY</a>-->
                            <a href="#" onclick="displayChart('grossMarginYoY')">Gross Margin YoY</a>
                            <a href="#" onclick="displayChart('operatingMarginYoY')">Operating Margin YoY</a>
                            <a href="#" onclick="displayChart('netProfitYoY')">Net ProfitYoY</a>
                    </div>
                </div>
            </div>


            <div id="loading" style="display: none; text-align: center;">
                <p>Loading... Please wait.</p>
            </div>

            
            <div id="comparisonResultContainer-tw">
                <canvas id="grossMarginChart"></canvas>
                <!-- Comparison results will be displayed here -->
            </div>
        `
    };

    const compareDiv = document.getElementById('compare');
    const sectionContainer = document.getElementById('section-container-compare-tw');

    if (sectionContainer) {
        // Load content
        sectionContainer.innerHTML = sections[sectionId] || '<p>Section not found</p>';

        // Toggle the section
        if (compareDiv.classList.contains('active')) {
            // Closing the section
            compareDiv.classList.remove('active');
            setTimeout(() => {
                compareDiv.style.display = 'none';
            }, 500);
        } else {
            // Opening the section
            compareDiv.style.display = 'block';
            // Force a reflow before adding the 'active' class
            void compareDiv.offsetWidth;
            compareDiv.classList.add('active');
        }

        // Toggle the overlay
        const overlay = document.querySelector('.overlay');
        overlay.classList.toggle('active');
        document.body.classList.toggle('modal-open');
    } else {
        console.error("Compare section not found");
    }
}

function toggleMenu(menuId) {
    const submenu = document.getElementById(menuId);
    const category = submenu.parentElement; // 取得 category 元素

    if (category.classList.contains('active')) {
        // 若已展開，則收起
        submenu.style.maxHeight = '0';
        submenu.style.opacity = '0';
        category.classList.remove('active');
    } else {
        // 若尚未展開，則展開
        submenu.style.maxHeight = submenu.scrollHeight + 'px'; // 使用實際內容高度
        submenu.style.opacity = '1';
        category.classList.add('active');
    }
}

const baseUrl = 'https://api.poseidonllp.com';

function sendMessage() {
    const inputField = document.getElementById('chat-input');
    const chatBox = document.getElementById('chat-box');
    const message = inputField.value.trim();

    if (message !== "") {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message');
        messageDiv.textContent = message;
        chatBox.appendChild(messageDiv);

        inputField.value = '';  // 清除輸入欄位

        // 創建 "Loading..." 提示
        const loadingDiv = document.createElement('div');
        loadingDiv.classList.add('chat-loading');
        loadingDiv.textContent = 'Loading...';
        chatBox.appendChild(loadingDiv);

        // 滾動到最新的聊天內容
        chatBox.scrollTop = chatBox.scrollHeight;

        fetch(`${baseUrl}/chat_llm`, {  // 修改成新的路徑
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })  // 傳遞使用者輸入
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json(); // 解析回應為 JSON
            })
            .then(data => {
                // 刪除 "Loading..." 提示
                chatBox.removeChild(loadingDiv);

                // 顯示 AI 回覆
                const responseDiv = document.createElement('div');
                responseDiv.classList.add('chat-response');
                responseDiv.textContent = data.reply || '此功能測試中';  // 當回應為空時顯示 "此功能測試中"
                chatBox.appendChild(responseDiv);
            })
            .catch(error => {
                console.error('Error fetching LLM response:', error);

                // 刪除 "Loading..." 提示
                chatBox.removeChild(loadingDiv);

                // 顯示錯誤訊息或 "此功能測試中"
                const responseDiv = document.createElement('div');
                responseDiv.classList.add('chat-response');
                responseDiv.textContent = '此功能測試中';
                chatBox.appendChild(responseDiv);
            });
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
        Promise.all([
            fetchCompanyProfile(stockSymbol),
            fetchCompanyPrice(stockSymbol)
        ]).then(() => {
            setTimeout(() => {
                clearSuggestions();
            }, 1500); // 延迟1秒后清除建议框
        });
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
        Promise.all([
            fetchJPCompanyProfile(stockSymbol),
            fetchJPCompanyPrice(stockSymbol)
        ]).then(() => {
            setTimeout(() => {
                clearSuggestions();
            }, 1500); // 延迟1秒后清除建议框
        });
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
        Promise.all([
            fetchTWCompanyProfile(fullStockSymbol),
            fetchTWCompanyPrice(fullStockSymbol)
        ]).then(() => {
            setTimeout(() => {
                clearSuggestions();
            }, 1500); // 延迟1秒后清除建议框
        });
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
        Promise.all([
            fetchEUCompanyProfile(stockSymbol),
            fetchEUCompanyPrice(stockSymbol)
        ]).then(() => {
            setTimeout(() => {
                clearSuggestions();
            }, 1500); // 延迟1秒后清除建议框
        });
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
        Promise.all([
            fetchKRCompanyProfile(stockSymbol),
            fetchKRCompanyPrice(stockSymbol)
        ]).then(() => {
            setTimeout(() => {
                clearSuggestions();
            }, 1500); // 延迟1秒后清除建议框
        });
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
        Promise.all([
            fetchHKCompanyProfile(stockSymbol),
            fetchHKCompanyPrice(stockSymbol)
        ]).then(() => {
            setTimeout(() => {
                clearSuggestions();
            }, 1500); // 延迟1秒后清除建议框
        });
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

        // Fetch and display company profile and price information
        Promise.all([
            fetchCNCompanyProfile(stockSymbol),
            fetchCNCompanyPrice(stockSymbol)
        ]).then(() => {
            setTimeout(() => {
                clearSuggestions();
            }, 1500); // 延迟1秒后清除建议框
        });
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
            event.preventDefault(); // 防止表單提交
            document.querySelector(buttonSelector).click(); // 觸發按鈕點擊事件

            // 隱藏對應的建議框
            clearSuggestions();

            // 延遲 0.3 秒再次清除建議框，確保不會再次顯示
            setTimeout(() => {
                clearSuggestions();
            }, 500); // 300 毫秒
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
// debounce 函數，延遲觸發事件
function debounce(func, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
}

// 顯示"載入中"狀態
function showLoadingSuggestions(container) {
    container.innerHTML = '<div>Loading...</div>';
    container.classList.add('active');
}

// 顯示"無建議"狀態
function showNoSuggestions(container) {
    container.innerHTML = '<div>No suggestions available</div>';
    container.classList.add('active');
}

// 清空建議列表
function clearSuggestions(container = null) {
    if (!container) {
        // 根據不同的 input id 對應不同的建議框容器
        const inputId = document.activeElement.id;
        switch (inputId) {
            case 'stockSymbol':
                container = document.getElementById('suggestions');
                break;
            case 'jpStockSymbol':
                container = document.getElementById('suggestionsJP');
                break;
            case 'twStockSymbol':
                container = document.getElementById('suggestionsTW');
                break;
            case 'euStockSymbol':
                container = document.getElementById('suggestionsEU');
                break;
            case 'krStockSymbol':
                container = document.getElementById('suggestionsKR');
                break;
            case 'hkStockSymbol':
                container = document.getElementById('suggestionsHK');
                break;
            case 'cnStockSymbol':
                container = document.getElementById('suggestionsCN');
                break;
            default:
                console.error('未知的輸入框 id');
                return;
        }
    }

    // 清空內容並隱藏建議框
    container.innerHTML = '';
    container.classList.remove('active');
}

// 美股
document.getElementById('stockSymbol').addEventListener('input', debounce(async function() {
    const stockSymbol = this.value.trim().toUpperCase();
    const suggestionsContainer = document.getElementById('suggestions');

    if (stockSymbol.length > 0) {
        showLoadingSuggestions(suggestionsContainer);
        const stockData = await fetchStockSuggestions(stockSymbol);
        if (this.value.trim().toUpperCase() === stockSymbol) {
            displaySuggestions(stockData, suggestionsContainer, 'stockSymbol');
        }
    } else {
        clearSuggestions(suggestionsContainer);
    }
}, 100));

async function fetchStockSuggestions(stockSymbol) {
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';
    const apiUrl = `https://financialmodelingprep.com/api/v3/search?query=${stockSymbol}&apikey=${apiKey}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const filteredData = data.filter(stock => stock.currency === 'USD');
        return filteredData.map(stock => stock.symbol);
    } catch (error) {
        console.error('Error fetching stock data:', error);
        return [];
    }
}

// 通用的顯示建議列表函數
function displaySuggestions(suggestions, suggestionsContainer, inputId) {
    suggestionsContainer.innerHTML = '';
    if (suggestions.length > 0) {
        suggestions.forEach(symbol => {
            const suggestionDiv = document.createElement('div');
            suggestionDiv.textContent = symbol;
            suggestionDiv.addEventListener('click', () => {
                event.stopPropagation();
                document.getElementById(inputId).value = symbol;
                clearSuggestions(suggestionsContainer); // 清除當前的建議框
            });
            suggestionsContainer.appendChild(suggestionDiv);
        });
        suggestionsContainer.classList.add('active');
    } else {
        showNoSuggestions(suggestionsContainer);
    }
}

// 歐股
document.getElementById('euStockSymbol').addEventListener('input', debounce(async function() {
    const stockSymbol = this.value.trim().toUpperCase();
    const suggestionsContainerEU = document.getElementById('suggestionsEU');

    if (stockSymbol.length > 0) {
        showLoadingSuggestions(suggestionsContainerEU);
        const stockData = await fetchStockSuggestionsEU(stockSymbol);
        if (this.value.trim().toUpperCase() === stockSymbol) {
            displaySuggestions(stockData, suggestionsContainerEU, 'euStockSymbol');
        }
    } else {
        clearSuggestions(suggestionsContainerEU);
    }
}, 100));

async function fetchStockSuggestionsEU(stockSymbol) {
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';
    const apiUrl = `https://financialmodelingprep.com/api/v3/search?query=${stockSymbol}&apikey=${apiKey}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const filteredData = data.filter(stock => stock.currency === 'EUR' || stock.currency === 'GBp');
        return filteredData.map(stock => stock.symbol);
    } catch (error) {
        console.error('Error fetching stock data:', error);
        return [];
    }
}

// 日股
document.getElementById('jpStockSymbol').addEventListener('input', debounce(async function() {
    const stockSymbol = this.value.trim().toUpperCase();
    const suggestionsContainerJP = document.getElementById('suggestionsJP');

    if (stockSymbol.length > 0) {
        showLoadingSuggestions(suggestionsContainerJP);
        const stockData = await fetchStockSuggestionsJP(stockSymbol);
        if (this.value.trim().toUpperCase() === stockSymbol) {
            displaySuggestions(stockData, suggestionsContainerJP, 'jpStockSymbol');
        }
    } else {
        clearSuggestions(suggestionsContainerJP);
    }
}, 100));

async function fetchStockSuggestionsJP(stockSymbol) {
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';
    const apiUrl = `https://financialmodelingprep.com/api/v3/search?query=${stockSymbol}&apikey=${apiKey}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const filteredData = data.filter(stock => stock.currency === 'JPY');
        return filteredData.map(stock => stock.symbol.replace('.T', ''));
    } catch (error) {
        console.error('Error fetching stock data:', error);
        return [];
    }
}

// 台股
document.getElementById('twStockSymbol').addEventListener('input', debounce(async function() {
    const stockSymbol = this.value.trim().toUpperCase();
    const suggestionsContainerTW = document.getElementById('suggestionsTW');

    if (stockSymbol.length > 0) {
        showLoadingSuggestions(suggestionsContainerTW);
        const stockData = await fetchStockSuggestionsTW(stockSymbol);
        if (this.value.trim().toUpperCase() === stockSymbol) {
            displaySuggestions(stockData, suggestionsContainerTW, 'twStockSymbol');
        }
    } else {
        clearSuggestions(suggestionsContainerTW);
    }
}, 100));

async function fetchStockSuggestionsTW(stockSymbol) {
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';
    const apiUrl = `https://financialmodelingprep.com/api/v3/search?query=${stockSymbol}&apikey=${apiKey}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        let symbols = data.filter(stock => stock.currency === 'TWD')
            .map(stock => stock.symbol.replace('.TW', '').replace('O', ''));
        return symbols;
    } catch (error) {
        console.error('Error fetching stock data:', error);
        return [];
    }
}

// 韓股
document.getElementById('krStockSymbol').addEventListener('input', debounce(async function() {
    const stockSymbol = this.value.trim().toUpperCase();
    const suggestionsContainerKR = document.getElementById('suggestionsKR');

    if (stockSymbol.length > 0) {
        showLoadingSuggestions(suggestionsContainerKR);
        const stockData = await fetchStockSuggestionsKR(stockSymbol);
        if (this.value.trim().toUpperCase() === stockSymbol) {
            displaySuggestions(stockData, suggestionsContainerKR, 'krStockSymbol');
        }
    } else {
        clearSuggestions(suggestionsContainerKR);
    }
}, 100));

async function fetchStockSuggestionsKR(stockSymbol) {
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';
    const apiUrl = `https://financialmodelingprep.com/api/v3/search?query=${stockSymbol}&apikey=${apiKey}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const filteredData = data.filter(stock => stock.currency === 'KRW');
        return filteredData.map(stock => stock.symbol);
    } catch (error) {
        console.error('Error fetching stock data:', error);
        return [];
    }
}

// 港股
document.getElementById('hkStockSymbol').addEventListener('input', debounce(async function() {
    const stockSymbol = this.value.trim().toUpperCase();
    const suggestionsContainerHK = document.getElementById('suggestionsHK');

    if (stockSymbol.length > 0) {
        showLoadingSuggestions(suggestionsContainerHK);
        const stockData = await fetchStockSuggestionsHK(stockSymbol);
        if (this.value.trim().toUpperCase() === stockSymbol) {
            displaySuggestions(stockData, suggestionsContainerHK, 'hkStockSymbol');
        }
    } else {
        clearSuggestions(suggestionsContainerHK);
    }
}, 100));

async function fetchStockSuggestionsHK(stockSymbol) {
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';
    const apiUrl = `https://financialmodelingprep.com/api/v3/search?query=${stockSymbol}&apikey=${apiKey}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const filteredData = data.filter(stock => stock.currency === 'HKD');
        return filteredData.map(stock => stock.symbol.replace('.HK', ''));
    } catch (error) {
        console.error('Error fetching stock data:', error);
        return [];
    }
}

// 中國股
document.getElementById('cnStockSymbol').addEventListener('input', debounce(async function() {
    const stockSymbol = this.value.trim().toUpperCase();
    const suggestionsContainerCN = document.getElementById('suggestionsCN');

    if (stockSymbol.length > 0) {
        showLoadingSuggestions(suggestionsContainerCN);
        const stockData = await fetchStockSuggestionsCN(stockSymbol);
        if (this.value.trim().toUpperCase() === stockSymbol) {
            displaySuggestions(stockData, suggestionsContainerCN, 'cnStockSymbol');
        }
    } else {
        clearSuggestions(suggestionsContainerCN);
    }
}, 100));

async function fetchStockSuggestionsCN(stockSymbol) {
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';
    const apiUrl = `https://financialmodelingprep.com/api/v3/search?query=${stockSymbol}&apikey=${apiKey}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const filteredData = data.filter(stock => stock.currency === 'CNY');
        return filteredData.map(stock => stock.symbol);
    } catch (error) {
        console.error('Error fetching stock data:', error);
        return [];
    }
}

//////////////////////////////Compare//////////////////////////////////////////////
// 全局變數來存儲當前圖表實例
let chartInstance = null;

async function fetchStockWithExchangeSuffix(stockCode, apiKey) {
    const searchUrl = `https://financialmodelingprep.com/api/v3/search?query=${stockCode}&apikey=${apiKey}`;

    try {
        const response = await fetch(searchUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // Filter results ending with .TW or .TWO
        const filteredData = data.filter(item => item.symbol.endsWith('.TW') || item.symbol.endsWith('.TWO'));

        if (filteredData.length > 0) {
            const match = filteredData.find(item => item.symbol.split('.')[0] === stockCode);
            return match ? match.symbol : null;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching stock exchange:', error);
        return null;
    }
}

async function fetchMarginData(stockSymbol, apiKey, type) {
    const apiUrl = `https://financialmodelingprep.com/api/v3/income-statement/${stockSymbol}?period=quarterly&limit=40&apikey=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        // Filter and map data based on type
        return data.map(item => ({
            date: item.date,
            margin: type === 'grossMargin' ? (item.grossProfit / item.revenue) * 100 :
                type === 'operatingMargin' ? (item.operatingIncome / item.revenue) * 100 :
                    type === 'netProfitMargin' ? (item.netIncome / item.revenue) * 100 : null
        })).filter(item => item.margin !== null).reverse();
    } catch (error) {
        console.error(`Error fetching ${type} data:`, error);
        return [];
    }
}

async function fetchEPSData(stockSymbol, apiKey) {
    const apiUrl = `https://financialmodelingprep.com/api/v3/income-statement/${stockSymbol}?period=quarter&limit=40&apikey=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        console.log("Fetched EPS Data:", data);  // 調試輸出 EPS 數據

        // 確保 EPS 數據非空且格式正確
        return data.map(item => ({
            date: item.date,
            eps: item.eps !== null && item.eps !== undefined ? item.eps : null  // 處理空值情況
        })).filter(item => item.eps !== null).reverse();  // 只返回非空的 EPS 並倒序排列
    } catch (error) {
        console.error('Error fetching EPS data:', error);
        return [];
    }
}

async function fetchROEData(stockSymbol, apiKey) {
    const apiUrl = `https://financialmodelingprep.com/api/v3/ratios/${stockSymbol}?period=quarter&limit=40&apikey=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        return data.map(item => ({
            date: item.date,
            margin: item.returnOnEquity * 100
        })).filter(item => item.margin !== null).reverse();
    } catch (error) {
        console.error('Error fetching ROE data:', error);
        return [];
    }
}

async function fetchOperatingMarginGrowthRate(stockSymbol, apiKey) {
    const apiUrl = `https://financialmodelingprep.com/api/v3/income-statement/${stockSymbol}?period=quarter&limit=40&apikey=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        const growthRates = data.map((item, index, array) => {
            if (index === array.length - 1) return null;  // 最後一筆數據無法計算成長率
            const currentMargin = item.operatingIncome / item.revenue;
            const prevMargin = array[index + 1].operatingIncome / array[index + 1].revenue;
            const growthRate = ((currentMargin - prevMargin) / prevMargin) * 100;
            return {
                date: item.date,
                margin: growthRate
            };
        }).filter(item => item !== null).reverse();

        return growthRates;
    } catch (error) {
        console.error('Error fetching operating margin growth rate data:', error);
        return [];
    }
}

async function fetchStockPriceData(stockSymbol, apiKey) {
    const apiUrl = `https://financialmodelingprep.com/api/v3/historical-price-full/${stockSymbol}?from=2010-01-01&apikey=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        return data.historical.map(item => ({
            date: item.date,
            price: item.close
        })).reverse();
    } catch (error) {
        console.error('Error fetching stock price data:', error);
        return [];
    }
}

async function fetchRevenueGrowthRate(stockSymbol, apiKey) {
    const apiUrl = `https://financialmodelingprep.com/api/v3/income-statement/${stockSymbol}?period=quarter&limit=40&apikey=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        const growthRates = data.map((item, index, array) => {
            if (index === array.length - 1) return null; // 最後一筆數據無法計算成長率
            const currentRevenue = item.revenue;
            const prevRevenue = array[index + 1].revenue;
            const growthRate = ((currentRevenue - prevRevenue) / prevRevenue) * 100;
            return {
                date: item.date,
                margin: growthRate
            };
        }).filter(item => item !== null).reverse();

        return growthRates;
    } catch (error) {
        console.error('Error fetching revenue growth rate data:', error);
        return [];
    }
}

async function fetchExternalROEData(stockSymbol, apiKey) {
    try {
        // 獲取 EPS 資料
        const epsData = await fetchEPSData(stockSymbol, apiKey);
        console.log("Fetched EPS Data:", epsData);

        // 獲取股價資料
        const stockPriceData = await fetchStockPriceData(stockSymbol, apiKey);
        console.log("Fetched Stock Price Data:", stockPriceData);

        // 將 EPS 和股價資料結合來計算外部 ROE（近四季 EPS 累計 / 股價）
        const externalROEData = stockPriceData.map(priceItem => {
            const priceDate = new Date(priceItem.date);

            // 找到所有日期不晚於股價日期的 EPS 資料
            const pastEPSData = epsData.filter(epsItem => new Date(epsItem.date) <= priceDate);

            // 按日期降序排序，取最近的四個季度
            const recentFourEPS = pastEPSData.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);

            // 計算四個季度的 EPS 總和
            const totalEPS = recentFourEPS.reduce((sum, epsItem) => sum + (epsItem.margin || 0), 0);

            if (totalEPS > 0) {
                const externalROE = (totalEPS / priceItem.price) * 100;  // 外部 ROE 計算
                console.log(`Stock Price Date: ${priceItem.date}, Total EPS: ${totalEPS}, Stock Price: ${priceItem.price}, External ROE: ${externalROE}`);
                return {
                    date: priceItem.date,
                    margin: externalROE
                };
            } else {
                console.log(`Not enough EPS data for stock price date: ${priceItem.date}`);
                return null;  // 若找不到足夠的 EPS 資料，則返回 null
            }
        }).filter(item => item !== null).reverse();  // 移除 null 並且將資料順序反轉（日期由舊到新）

        return externalROEData;
    } catch (error) {
        console.error('Error fetching external ROE data:', error);
        return [];
    }
}

async function fetchQuarterlyRevenueGrowthRate(stockSymbol, apiKey) {
    // 確保拉取至少40個季度（10年）的數據
    const apiUrl = `https://financialmodelingprep.com/api/v3/income-statement/${stockSymbol}?period=quarter&limit=40&apikey=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        // 確保數據是按照日期順序排列（從舊到新）
        const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));

        // 計算同比成長率，即相同季度之間的成長率 (2024Q1 vs 2023Q1)
        const growthRates = sortedData.map((item, index, array) => {
            // 找到去年同一季度的數據 (index - 4 是去年的同一季度)
            const previousYearSameQuarterIndex = array.findIndex((prevItem, i) => {
                const currentDate = new Date(item.date);
                const prevDate = new Date(prevItem.date);
                return (
                    currentDate.getFullYear() - 1 === prevDate.getFullYear() &&
                    currentDate.getMonth() === prevDate.getMonth()
                );
            });

            if (previousYearSameQuarterIndex !== -1) {
                const currentRevenue = item.revenue;
                const previousRevenue = array[previousYearSameQuarterIndex].revenue;
                const growthRate = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
                return {
                    date: item.date,
                    margin: growthRate
                };
            }
            return null; // 如果沒有對應的前一年同季度，返回 null
        }).filter(item => item !== null);  // 移除 null 的項目

        return growthRates;
    } catch (error) {
        console.error('Error fetching quarterly revenue growth rate data:', error);
        return [];
    }
}

async function fetchPERatioData(stockSymbol, apiKey) {
    try {
        // 並行獲取每日股價資料和 EPS 資料（按季度）
        const stockPriceData = await fetchStockPriceData(stockSymbol, apiKey);
        const epsData = await fetchEPSData(stockSymbol, apiKey);

        console.log("Fetched Stock Price Data:", stockPriceData);
        console.log("Fetched EPS Data:", epsData);

        // 檢查資料是否齊全
        if (!stockPriceData.length || !epsData.length) {
            console.error('Stock price or EPS data is missing.');
            return [];
        }

        // 計算每日的 P/E ratio (股價 / 最近一個季度 EPS)
        const peData = stockPriceData.map(priceEntry => {
            const priceDate = new Date(priceEntry.date);

            // 找到股價日期之前最近的一個季度的 EPS 資料
            const recentEPS = epsData
                .filter(epsEntry => new Date(epsEntry.date) <= priceDate) // 找到日期不晚於當前股價日期的 EPS
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0];  // 取最近的一個季度

            // 如果找不到對應的 EPS 資料，跳過該日期
            if (!recentEPS || recentEPS.eps === null) {
                console.warn(`No EPS data for date ${priceEntry.date}`);
                return null;
            }

            // 計算 P/E Ratio 並保留小數點後兩位
            const peRatio = (priceEntry.price / recentEPS.eps).toFixed(2);

            return {
                date: priceEntry.date,
                peRatio: parseFloat(peRatio),  // 保留兩位小數後的 P/E Ratio
            };
        }).filter(entry => entry !== null);  // 過濾掉沒有對應 EPS 的日期

        return peData.reverse(); // 將數據順序反轉，從舊到新
    } catch (error) {
        console.error('Error fetching P/E ratio data:', error);
        return [];
    }
}

async function fetchGrossMarginYoY(stockSymbol, apiKey) {
    const apiUrl = `https://financialmodelingprep.com/api/v3/income-statement/${stockSymbol}?period=quarter&limit=40&apikey=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        // 確保數據按照季度日期從舊到新排序
        const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));

        console.log("Sorted data:", sortedData);  // 檢查排序後的數據

        // 按季度計算毛利同比變化 = (今年Qx毛利 - 去年Qx毛利) / 去年Qx毛利
        const grossProfitYoY = sortedData.map((item, index, array) => {
            // 查找去年的同一季度，通常 index - 4 是去年同一季度的數據
            if (index < 4) return null;  // 如果當前數據在前四筆，無法計算同比

            const currentGrossProfit = item.grossProfit;  // 當前季度的毛利總額
            const previousGrossProfit = array[index - 4].grossProfit;  // 去年同一季度的毛利總額

            if (previousGrossProfit === 0) return null;  // 避免除以0

            const growthRate = ((currentGrossProfit - previousGrossProfit) / previousGrossProfit) * 100;  // 計算同比變化

            return {
                date: item.date.split('T')[0],  // 去除時間部分，保留日期
                grossProfitYoY: growthRate
            };
        }).filter(item => item !== null).reverse();  // 移除無法計算的數據並反轉順序（由舊到新）

        console.log("Processed data:", grossProfitYoY);  // 檢查處理後的結果

        return grossProfitYoY;
    } catch (error) {
        console.error('Error fetching gross profit YoY data:', error);
        return [];
    }
}

async function fetchOperatingMarginYoY(stockSymbol, apiKey) {
    const apiUrl = `https://financialmodelingprep.com/api/v3/income-statement/${stockSymbol}?period=quarter&limit=40&apikey=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        // 確保數據按照季度日期從舊到新排序
        const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));

        console.log("Sorted data:", sortedData);  // 檢查排序後的數據

        // 按季度計算營業利潤率 YoY，營業利潤率 = (營業收入 / 營收) * 100
        const operatingMarginYoY = sortedData.map((item, index, array) => {
            // 查找去年的同一季度，通常 index - 4 是去年同一季度的數據
            if (index < 4) return null;  // 如果當前數據在前四筆，無法計算同比

            const currentOperatingMargin = item.operatingIncome;  // 當前季度的營業收入
            const previousOperatingMargin = array[index - 4].operatingIncome;  // 去年同一季度的營業收入

            if (previousOperatingMargin === 0) return null;  // 避免除以0

            const growthRate = ((currentOperatingMargin - previousOperatingMargin) / previousOperatingMargin) * 100;  // 計算同比變化

            return {
                date: item.date.split('T')[0],  // 去除時間部分，保留日期
                operatingMarginYoY: growthRate
            };
        }).filter(item => item !== null).reverse();  // 移除無法計算的數據並反轉順序（由舊到新）

        console.log("Processed data:", operatingMarginYoY);  // 檢查處理後的結果

        return operatingMarginYoY;
    } catch (error) {
        console.error('Error fetching operating margin YoY data:', error);
        return [];
    }
}

async function fetchNetProfitYoY(stockSymbol, apiKey) {
    const apiUrl = `https://financialmodelingprep.com/api/v3/income-statement/${stockSymbol}?period=quarter&limit=40&apikey=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        // 確保數據按照季度日期從舊到新排序
        const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));

        console.log("Sorted data:", sortedData);  // 檢查排序後的數據

        // 按季度計算淨利潤率 YoY，淨利潤率 = (淨利潤 / 營收) * 100
        const netProfitYoY = sortedData.map((item, index, array) => {
            // 查找去年的同一季度，通常 index - 4 是去年同一季度的數據
            if (index < 4) return null;  // 如果當前數據在前四筆，無法計算同比

            const currentNetProfit = item.netIncome;  // 當前季度的淨利潤
            const previousNetProfit = array[index - 4].netIncome;  // 去年同一季度的淨利潤

            if (previousNetProfit === 0) return null;  // 避免除以0

            const growthRate = ((currentNetProfit - previousNetProfit) / previousNetProfit) * 100;  // 計算同比變化

            return {
                date: item.date.split('T')[0],  // 去除時間部分，保留日期
                netProfitYoY: growthRate
            };
        }).filter(item => item !== null).reverse();  // 移除無法計算的數據並反轉順序（由舊到新）

        console.log("Processed data:", netProfitYoY);  // 檢查處理後的結果

        return netProfitYoY;
    } catch (error) {
        console.error('Error fetching net profit YoY data:', error);
        return [];
    }
}

async function displayChart(type) {
    const stock1 = document.getElementById('stock1-tw').value.trim();
    const stock2 = document.getElementById('stock2-tw').value.trim();
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';
    const loadingElement = document.getElementById('loading');

    if (!stock1 || !stock2) {
        alert('Please enter both stock symbols.');
        return;
    }

    const fullStockSymbol1 = await fetchStockWithExchangeSuffix(stock1, apiKey);
    const fullStockSymbol2 = await fetchStockWithExchangeSuffix(stock2, apiKey);

    if (!fullStockSymbol1 || !fullStockSymbol2) {
        alert('Unable to determine stock exchange for one or both symbols.');
        return;
    }

    try {
        loadingElement.style.display = 'block';

        let data1, data2;

        switch (type) {
            // 新增 P/E ratio 的 case
            case 'peRatio':
                data1 = await fetchPERatioData(fullStockSymbol1, apiKey);
                data2 = await fetchPERatioData(fullStockSymbol2, apiKey);
                break;
            case 'grossMargin':
            case 'operatingMargin':
            case 'netProfitMargin':
                data1 = await fetchMarginData(fullStockSymbol1, apiKey, type);
                data2 = await fetchMarginData(fullStockSymbol2, apiKey, type);
                break;
            case 'eps':
                data1 = await fetchEPSData(fullStockSymbol1, apiKey);
                data2 = await fetchEPSData(fullStockSymbol2, apiKey);
                break;
            case 'roe':
                data1 = await fetchROEData(fullStockSymbol1, apiKey);
                data2 = await fetchROEData(fullStockSymbol2, apiKey);
                break;
            case 'operatingMarginGrowthRate':
                data1 = await fetchOperatingMarginGrowthRate(fullStockSymbol1, apiKey);
                data2 = await fetchOperatingMarginGrowthRate(fullStockSymbol2, apiKey);
                break;
            case 'stockPrice':
                data1 = await fetchStockPriceData(fullStockSymbol1, apiKey);
                data2 = await fetchStockPriceData(fullStockSymbol2, apiKey);
                break;
            case 'revenueGrowthRate':
                data1 = await fetchRevenueGrowthRate(fullStockSymbol1, apiKey);
                data2 = await fetchRevenueGrowthRate(fullStockSymbol2, apiKey);
                break;
            case 'externalROE':
                data1 = await fetchExternalROEData(fullStockSymbol1, apiKey);
                data2 = await fetchExternalROEData(fullStockSymbol2, apiKey);
                break;
            case 'quarterlyRevenueGrowthRate':  // 新增季度營收成長率的 case
                data1 = await fetchQuarterlyRevenueGrowthRate(fullStockSymbol1, apiKey);
                data2 = await fetchQuarterlyRevenueGrowthRate(fullStockSymbol2, apiKey);
                break;

            case 'grossMarginYoY':
                data1 = await fetchGrossMarginYoY(fullStockSymbol1, apiKey);
                data2 = await fetchGrossMarginYoY(fullStockSymbol2, apiKey);
                break;
            case 'operatingMarginYoY':
                data1 = await fetchOperatingMarginYoY(fullStockSymbol1, apiKey);
                data2 = await fetchOperatingMarginYoY(fullStockSymbol2, apiKey);
                break;
            case 'netProfitYoY':
                data1 = await fetchNetProfitYoY(fullStockSymbol1, apiKey);
                data2 = await fetchNetProfitYoY(fullStockSymbol2, apiKey);
                break;
            default:
                throw new Error('Invalid chart type');
        }

        drawChart(
            `${fullStockSymbol1} ${type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1').trim()}`,
            `${fullStockSymbol2} ${type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1').trim()}`,
            data1,
            data2,
            type
        );

    } catch (error) {
        console.error('Error fetching data:', error);
        alert('There was an error retrieving stock data.');
    } finally {
        loadingElement.style.display = 'none';
    }
}

function drawChart(label1, label2, data1, data2, type) {
    const ctx = document.getElementById('grossMarginChart').getContext('2d');

    if (chartInstance) {
        chartInstance.destroy();
    }

    const allDates = [...new Set([...data1.map(item => item.date.split('T')[0]), ...data2.map(item => item.date.split('T')[0])])].sort((a, b) => new Date(a) - new Date(b));

    console.log('All Dates:', allDates);

    const formattedData1 = allDates.map(date => {
        const entry = data1.find(item => item.date.split('T')[0] === date);
        if (!entry) return null;

        switch (type) {
            case 'grossMarginYoY': return entry.grossProfitYoY !== undefined ? entry.grossProfitYoY : null;
            case 'operatingMarginYoY': return entry.operatingMarginYoY !== undefined ? entry.operatingMarginYoY : null;
            case 'netProfitYoY': return entry.netProfitYoY !== undefined ? entry.netProfitYoY : null;
            case 'eps': return entry.eps !== undefined ? entry.eps : null;
            case 'grossMargin':
            case 'operatingMargin':
            case 'netProfitMargin':
            case 'roe':
            case 'operatingMarginGrowthRate':
            case 'revenueGrowthRate':
            case 'externalROE':
            case 'quarterlyRevenueGrowthRate':
                return entry.margin !== undefined ? entry.margin : null;
            case 'stockPrice': return entry.price !== undefined ? entry.price : null;
            case 'peRatio': return entry.peRatio !== undefined ? entry.peRatio : null;
            default: return null;
        }
    });

    const formattedData2 = allDates.map(date => {
        const entry = data2.find(item => item.date.split('T')[0] === date);
        if (!entry) return null;

        switch (type) {
            case 'grossMarginYoY': return entry.grossProfitYoY !== undefined ? entry.grossProfitYoY : null;
            case 'operatingMarginYoY': return entry.operatingMarginYoY !== undefined ? entry.operatingMarginYoY : null;
            case 'netProfitYoY': return entry.netProfitYoY !== undefined ? entry.netProfitYoY : null;
            case 'eps': return entry.eps !== undefined ? entry.eps : null;
            case 'grossMargin':
            case 'operatingMargin':
            case 'netProfitMargin':
            case 'roe':
            case 'operatingMarginGrowthRate':
            case 'revenueGrowthRate':
            case 'externalROE':
            case 'quarterlyRevenueGrowthRate':
                return entry.margin !== undefined ? entry.margin : null;
            case 'stockPrice': return entry.price !== undefined ? entry.price : null;
            case 'peRatio': return entry.peRatio !== undefined ? entry.peRatio : null;
            default: return null;
        }
    });

    console.log('Formatted Data 1:', formattedData1);
    console.log('Formatted Data 2:', formattedData2);

    const chartType = (type === 'eps') ? 'bar' : 'line';

    const chartData = {
        labels: allDates,
        datasets: [
            {
                label: label1,
                data: formattedData1,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: (type === 'eps') ? 'rgba(75, 192, 192, 0.7)' : 'transparent',
                spanGaps: true,
                fill: false,
            },
            {
                label: label2,
                data: formattedData2,
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: (type === 'eps') ? 'rgba(255, 99, 132, 0.7)' : 'transparent',
                spanGaps: true,
                fill: false,
            }
        ]
    };

    console.log('Chart Data:', chartData);

    chartInstance = new Chart(ctx, {
        type: chartType,
        data: chartData,
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: { unit: 'quarter' },
                    ticks: { autoSkip: true, maxRotation: 0, minRotation: 0 }
                },
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            if (type === 'stockPrice') {
                                return '$' + value.toFixed(2);
                            } else if (type === 'peRatio') {
                                return value.toFixed(2);  // 不附加百分比
                            }
                            return type === 'eps' ? value.toFixed(2) : value.toFixed(2) + '%';
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            const rawValue = tooltipItem.raw;
                            if (rawValue !== null) {
                                if (type === 'stockPrice') return '$' + rawValue.toFixed(2);
                                else if (type === 'peRatio') return rawValue.toFixed(2); // 不附加百分比
                                return rawValue.toFixed(2) + (type === 'eps' ? '' : '%');
                            }
                            return 'No data';
                        }
                    }
                }
            }
        }
    });
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

let peBandChartInstances = {};

function fetchIncomeStatement() {
    const stockSymbol = fetchStock();
    const period = document.getElementById('period').value;
    const yearRange = document.getElementById('yearRange').value;
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf'; // 請替換為你的實際 API 密鑰

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/income-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_IncomeStatement(apiUrl, displayIncomeStatement, 'incomeStatementContainer', 'incomeStatementChart', 'operatingChart', period, yearRange);

    // 新增：本益比河流圖的 API 請求
    // const priceApiUrl = `https://financialmodelingprep.com/api/v3/historical-price-full/${stockSymbol}?timeseries=3650&apikey=${apiKey}`;
    // const epsApiUrl = `https://financialmodelingprep.com/api/v3/income-statement/${stockSymbol}?limit=40&period=quarter&apikey=${apiKey}`;
    //
    // // 獲取本益比河流圖的數據
    // fetchPEBandData(priceApiUrl, epsApiUrl, displayPEBandChart);
}

function fetchJPIncomeStatement() {
    const stockSymbol = fetchJPStock();
    const period = document.getElementById('periodJP').value;
    const yearRange = document.getElementById('yearRangeJP').value;
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/income-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_IncomeStatement(apiUrl, displayIncomeStatement, 'incomeStatementContainerJP', 'incomeStatementChartJP', 'operatingChartJP', period , yearRange);

    // 請求本益比河流圖的資料
    const priceApiUrl = `https://financialmodelingprep.com/api/v3/historical-price-full/${stockSymbol}?timeseries=3650&apikey=${apiKey}`;
    const epsApiUrl = `https://financialmodelingprep.com/api/v3/income-statement/${stockSymbol}?limit=40&period=quarter&apikey=${apiKey}`;
    fetchPEBandData(priceApiUrl, epsApiUrl, 'peBandChartJP'); // 傳入對應的 chartId
}

async function fetchTWIncomeStatement() {
    const stockSymbol = await fetchTWStock();
    const period = document.getElementById('periodTW').value;
    const yearRange = document.getElementById('yearRangeTW').value;  // 使用對應的年份範圍選擇器
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/income-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_IncomeStatement(apiUrl, displayIncomeStatement, 'incomeStatementContainerTW', 'incomeStatementChartTW', 'operatingChartTW', period ,yearRange);

    // const priceApiUrl = `https://financialmodelingprep.com/api/v3/historical-price-full/${stockSymbol}?timeseries=3650&apikey=${apiKey}`;
    // const epsApiUrl = `https://financialmodelingprep.com/api/v3/income-statement/${stockSymbol}?limit=40&period=quarter&apikey=${apiKey}`;
    // fetchPEBandData(priceApiUrl, epsApiUrl, 'peBandChartTW');
}

function fetchEUIncomeStatement() {
    const stockSymbol = fetchEUStock();
    const period = document.getElementById('periodEU').value;
    const yearRange = document.getElementById('yearRangeEU').value;  // 使用對應的年份範圍選擇器
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/income-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_IncomeStatement(apiUrl, displayIncomeStatement, 'incomeStatementContainerEU', 'incomeStatementChartEU', 'operatingChartEU', period ,yearRange);

    const priceApiUrl = `https://financialmodelingprep.com/api/v3/historical-price-full/${stockSymbol}?timeseries=3650&apikey=${apiKey}`;
    const epsApiUrl = `https://financialmodelingprep.com/api/v3/income-statement/${stockSymbol}?limit=40&period=quarter&apikey=${apiKey}`;
    fetchPEBandData(priceApiUrl, epsApiUrl, 'peBandChartEU');
}

function fetchKRIncomeStatement() {
    const stockSymbol = fetchKRStock();
    const period = document.getElementById('periodKR').value;
    const yearRange = document.getElementById('yearRangeKR').value;  // 使用對應的年份範圍選擇器
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/income-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_IncomeStatement(apiUrl, displayIncomeStatement, 'incomeStatementContainerKR', 'incomeStatementChartKR', 'operatingChartKR', period ,yearRange);

    const priceApiUrl = `https://financialmodelingprep.com/api/v3/historical-price-full/${stockSymbol}?timeseries=3650&apikey=${apiKey}`;
    const epsApiUrl = `https://financialmodelingprep.com/api/v3/income-statement/${stockSymbol}?limit=40&period=quarter&apikey=${apiKey}`;
    fetchPEBandData(priceApiUrl, epsApiUrl, 'peBandChartKR');
}

function fetchHKIncomeStatement() {
    const stockSymbol = fetchHKStock();
    const period = document.getElementById('periodHK').value;
    const yearRange = document.getElementById('yearRangeHK').value;  // 使用對應的年份範圍選擇器
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/income-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_IncomeStatement(apiUrl, displayIncomeStatement, 'incomeStatementContainerHK', 'incomeStatementChartHK', 'operatingChartHK', period ,yearRange);

    const priceApiUrl = `https://financialmodelingprep.com/api/v3/historical-price-full/${stockSymbol}?timeseries=3650&apikey=${apiKey}`;
    const epsApiUrl = `https://financialmodelingprep.com/api/v3/income-statement/${stockSymbol}?limit=40&period=quarter&apikey=${apiKey}`;
    fetchPEBandData(priceApiUrl, epsApiUrl, 'peBandChartHK');
}

function fetchCNIncomeStatement() {
    const stockSymbol = fetchCNStock();
    const period = document.getElementById('periodCN').value;
    const yearRange = document.getElementById('yearRangeCN').value;  // 使用對應的年份範圍選擇器
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/income-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_IncomeStatement(apiUrl, displayIncomeStatement, 'incomeStatementContainerCN', 'incomeStatementChartCN', 'operatingChartCN', period ,yearRange);

    const priceApiUrl = `https://financialmodelingprep.com/api/v3/historical-price-full/${stockSymbol}?timeseries=3650&apikey=${apiKey}`;
    const epsApiUrl = `https://financialmodelingprep.com/api/v3/income-statement/${stockSymbol}?limit=40&period=quarter&apikey=${apiKey}`;
    fetchPEBandData(priceApiUrl, epsApiUrl, 'peBandChartCN');
}

function fetchPEBandData(priceApiUrl, epsApiUrl, chartId) {
    // 並行請求股價和 EPS 數據
    Promise.all([fetch(priceApiUrl), fetch(epsApiUrl)])
        .then(responses => Promise.all(responses.map(response => response.json())))
        .then(([priceData, epsData]) => {
            if (priceData.historical && Array.isArray(epsData)) {
                const peData = calculatePEData(priceData.historical, epsData);
                displayPEBandChart(peData, chartId); // 傳入對應的圖表 ID
            } else {
                console.error("Invalid data from price or EPS API");
            }
        })
        .catch(error => {
            console.error('Error fetching PE Band data:', error);
        });
}

function calculatePEData(priceData, epsData) {
    const peData = priceData.map(priceEntry => {
        const date = priceEntry.date;
        const priceDate = new Date(date);

        // 尋找過去四季的 EPS 數據，將其累加起來
        const cumulativeEPS = epsData.reduce((acc, epsEntry) => {
            const epsDate = new Date(epsEntry.date);
            if (epsDate <= priceDate && acc.count < 4) {
                acc.total += epsEntry.eps;
                acc.count += 1;
            }
            return acc;
        }, { total: 0, count: 0 }).total;

        // 確保有對應的 EPS 數據，並計算本益比
        if (cumulativeEPS > 0) {
            const peRatio = priceEntry.close / cumulativeEPS;
            return {
                date: date,
                peRatio: peRatio,
            };
        }
        return null;
    }).filter(entry => entry !== null); // 過濾掉沒有對應 EPS 的數據

    return peData;
}

function resetState(chartId, containerId) {
    if (incomeStatementChartInstances[chartId]) {
        incomeStatementChartInstances[chartId].destroy();
        delete incomeStatementChartInstances[chartId];
    }

    // 清除容器的內容，防止殘留狀態
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '';
    }
}

function fetchData_IncomeStatement(apiUrl, callback, containerId, chartId, operatingChartId, period, yearRange) {
    const container = document.getElementById(containerId);

    // 重置状态和清理容器
    resetState(chartId, containerId);

    container.innerHTML = '<p>Loading...</p>';

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (!Array.isArray(data) || data.length === 0) {
                container.innerHTML = '<p>No data found for this symbol.</p>';
                return;
            }

            // 使用传入的 yearRange 参数，并调用 updateDisplayedYears
            updateDisplayedYears(data, container, chartId, operatingChartId, period, yearRange);

            // 调用 displayIncomeStatement 并传入所有需要的参数
            callback(data, container, chartId, operatingChartId, period, yearRange);
        })
        .catch(error => {
            console.error('Error fetching data: ', error);
            container.innerHTML = '<p>Error loading data. Please check the console for more details.</p>';
        });
}

function displayIncomeStatement(data, container, chartId, operatingChartId, period, yearRange) {
    const currentYear = new Date().getFullYear();

    // 過濾數據以包含多兩年的數據
    const filteredDataForTable = data.filter(entry => {
        const entryYear = parseInt(entry.calendarYear);
        return yearRange === 'all' || (currentYear - entryYear <= (parseInt(yearRange) + 1));
    });

    const filteredDataForChart = filteredDataForTable.filter((entry, index) => {
        return !(index === 0 && entry.growthRate === 'N/A');
    });

    if (!filteredDataForTable || !Array.isArray(filteredDataForTable) || filteredDataForTable.length === 0) {
        container.innerHTML = '<p>Data not available.</p>';
        const expandButton = document.getElementById('expandButton_Income');
        if (expandButton) expandButton.style.display = 'none';
        const collapseButton = document.getElementById('collapseButton_Income');
        if (collapseButton) collapseButton.style.display = 'none';
        return;
    }

    // 按日期升序排序
    filteredDataForTable.sort((a, b) => new Date(a.date) - new Date(b.date));

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
        link: ['SEC Link'],
        finalLink: ['10K Link'],
        growthRate: [period === 'annual' ? 'YoY Growth' : 'YoY Growth']
    };

    // 填充行數據並計算增長率
    filteredDataForTable.forEach((entry, index) => {
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

        // 新增 link 和 finalLink
        rows.link.push(entry.link ? `<a class="styled-link" href="${entry.link}" target="_blank">Link</a>` : 'N/A');
        rows.finalLink.push(entry.finalLink ? `<a class="styled-link" href="${entry.finalLink}" target="_blank">Final Link</a>` : 'N/A');

        // 計算增長率
        if (index > 0) {
            if (period === 'annual') {
                let lastRevenue = filteredDataForTable[index - 1].revenue;
                if (entry.revenue && lastRevenue) {
                    let growthRate = ((entry.revenue - lastRevenue) / lastRevenue) * 100;
                    entry.growthRate = parseFloat(growthRate.toFixed(2));
                    rows.growthRate.push(entry.growthRate);
                } else {
                    entry.growthRate = null;
                    rows.growthRate.push('N/A');
                }
            } else {
                let previousYearSameQuarterIndex = filteredDataForTable.findIndex(e => e.calendarYear === (entry.calendarYear - 1).toString() && e.period === entry.period);
                if (previousYearSameQuarterIndex !== -1) {
                    let lastRevenue = filteredDataForTable[previousYearSameQuarterIndex].revenue;
                    if (entry.revenue && lastRevenue) {
                        let growthRate = ((entry.revenue - lastRevenue) / lastRevenue) * 100;
                        entry.growthRate = parseFloat(growthRate.toFixed(2));
                        rows.growthRate.push(entry.growthRate);
                    } else {
                        entry.growthRate = null;
                        rows.growthRate.push('N/A');
                    }
                } else {
                    entry.growthRate = null;
                    rows.growthRate.push('N/A');
                }
            }
        } else {
            entry.growthRate = null;
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

    // 創建容器結構，並綁定唯一的下載按鈕ID
    const downloadButtonId = `downloadBtn_${chartId}`;
    container.innerHTML = `
        <button id="${downloadButtonId}">Download as Excel</button>
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
        <!-- 新增本益比河流圖的canvas -->
        <div id="peBandContainer" style="margin-top: 20px;">
            <canvas id="peBandChart_${chartId}"></canvas>
        </div>
    `;

    // 設置scroll位置
    setTimeout(() => {
        const scrollContainer = document.getElementById(`${chartId}ScrollContainer`);
        if (scrollContainer) {
            scrollContainer.scrollLeft = scrollContainer.scrollWidth;
            if (scrollContainer.scrollLeft < scrollContainer.scrollWidth - scrollContainer.clientWidth) {
                scrollContainer.scrollLeft = scrollContainer.scrollWidth;
            }
        }
    }, 100);

    // 創建圖表，僅使用篩選後的數據（刪除多出來的那一年）
    createOperatingChart(filteredDataForChart, operatingChartId);
    createIncomeStatementChart(filteredDataForChart, chartId);
    const peBandCanvasId = `peBandChart_${chartId}`;

    // 新增：創建本益比河流圖
    setTimeout(() => {
        fetchPEBandData(
            `https://financialmodelingprep.com/api/v3/historical-price-full/${data[0].symbol}?timeseries=3650&apikey=GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf`,  // 改成3650天（10年）
            `https://financialmodelingprep.com/api/v3/income-statement/${data[0].symbol}?limit=40&period=quarter&apikey=GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf`,  // 確保是10年的季度數據
            peBandCanvasId // 傳入帶有 chartId 的唯一 ID
        );
    }, 500);

    const expandButton = document.getElementById('expandButton_Income');
    if (expandButton) expandButton.style.display = 'inline';

    // 清除舊的事件並綁定新的下載按鈕事件
    bindDownloadButton(rows, data[0].symbol, downloadButtonId);
}

function bindDownloadButton(rows, symbol, buttonId) {
    setTimeout(() => {
        const downloadBtn = document.getElementById(buttonId);
        if (downloadBtn) {
            // 先移除舊的事件綁定
            downloadBtn.onclick = null;

            // 直接使用新的事件處理函數綁定
            downloadBtn.onclick = function() {
                downloadExcel(rows, symbol);
            };
        }
    }, 100);  // 延遲執行以確保 DOM 已完全更新
}
// 下载 Excel 文件的函数
function downloadExcel(rows, symbol) {
    // Check if rows is defined and not empty
    if (!rows || Object.keys(rows).length === 0) {
        alert('No data available for download.');
        return;
    }

    // Convert the rows object to an array format
    const data = Object.keys(rows).map(key => rows[key]);

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Income Statement");

    // Use the stock symbol to name the file
    XLSX.writeFile(wb, `${symbol}_income_statement.xlsx`);
}

function updateDisplayedYears(data, container, chartId, operatingChartId, period, yearRange) {
    if (!data || !Array.isArray(data)) {
        console.error("Data is undefined or not an array");
        return;
    }

    const currentYear = new Date().getFullYear();
    const filteredData = data.filter(entry => {
        const entryYear = parseInt(entry.calendarYear);
        return yearRange === 'all' || (currentYear - entryYear <= yearRange);
    });
    displayIncomeStatement(filteredData, container, chartId, operatingChartId, period, yearRange);
}

function createOperatingChart(data, chartId) {
    data.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 保留所有有效的数据，过滤掉增长率为 null 的数据
    const validData = data.filter(entry => entry.growthRate !== null);

    const ctx = document.getElementById(chartId).getContext('2d');

    if (incomeStatementChartInstances[chartId]) {
        incomeStatementChartInstances[chartId].destroy();
    }

    incomeStatementChartInstances[chartId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: validData.map(entry => entry.date),
            datasets: [
                {
                    label: 'Revenue',
                    data: validData.map(entry => entry.revenue),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    yAxisID: 'y'
                },
                {
                    label: 'Cost of Revenue',
                    data: validData.map(entry => entry.costOfRevenue),
                    borderColor: 'rgba(153, 102, 255, 1)',
                    backgroundColor: 'rgba(153, 102, 255, 0.6)',
                    yAxisID: 'y'
                },
                {
                    label: 'Operating Expenses',
                    data: validData.map(entry => entry.operatingExpenses),
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    yAxisID: 'y'
                },
                {
                    label: 'Operating Income',
                    data: validData.map(entry => entry.operatingIncome),
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    yAxisID: 'y'
                },
                {
                    label: 'Growth Rate',
                    data: validData.map(entry => entry.growthRate),
                    type: 'line',
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
                        text: 'Growth Rate (%)'
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

function createIncomeStatementChart(data, chartId) {
    data.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 过滤掉增长率为 null 的数据
    const validData = data.filter(entry => entry.growthRate !== null);

    const ctx = document.getElementById(chartId).getContext('2d');

    if (incomeStatementChartInstances[chartId]) {
        incomeStatementChartInstances[chartId].destroy();
    }

    incomeStatementChartInstances[chartId] = new Chart(ctx, {
        data: {
            labels: validData.map(entry => entry.date),
            datasets: [
                {
                    type: 'bar',
                    label: 'EPS',
                    data: validData.map(entry => entry.eps),
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    yAxisID: 'y'
                },
                {
                    type: 'line',
                    label: 'Gross Profit Ratio',
                    data: validData.map(entry => entry.grossProfitRatio * 100),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    yAxisID: 'y1'
                },
                {
                    type: 'line',
                    label: 'Operating Income Ratio',
                    data: validData.map(entry => entry.operatingIncomeRatio * 100),
                    borderColor: 'rgba(153, 102, 255, 1)',
                    backgroundColor: 'rgba(153, 102, 255, 0.6)',
                    yAxisID: 'y1'
                },
                {
                    type: 'line',
                    label: 'Net Income Ratio',
                    data: validData.map(entry => entry.netIncomeRatio * 100),
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

function displayPEBandChart(peData, chartId) {
    const canvas = document.getElementById(chartId);

    // 檢查 canvas 是否已正確生成
    if (!canvas) {
        console.error(`Canvas with ID ${chartId} not found.`);
        return;
    }

    const ctx = canvas.getContext('2d');

    // 確保將日期轉換為 Date 對象
    const dates = peData.map(entry => new Date(entry.date));
    const peRatios = peData.map(entry => entry.peRatio);

    // 檢查是否已有先前的圖表實例
    if (peBandChartInstances[chartId]) {
        peBandChartInstances[chartId].destroy();
    }

    // 創建新的圖表實例
    peBandChartInstances[chartId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'P/E Ratio',
                data: peRatios,
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: false,
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'year',
                        tooltipFormat: 'yyyy-MM-dd',  // 使用小寫 'yyyy'
                    },
                    title: {
                        display: true,
                        text: 'Date',
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: 'P/E Ratio',
                    },
                },
            },
        },
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
    const yearRange = document.getElementById('yearRange_2').value;  // 新增年份選擇
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_BalanceSheet(apiUrl, displayBalanceSheet, 'balanceSheetContainer', 'balanceSheetChartUS', period, yearRange);
}

function fetchJPBalanceSheet() {
    const stockSymbol = fetchJPStock();
    const period = document.getElementById('periodJP_2').value;
    const yearRange = document.getElementById('yearRangeJP_2').value;  // 新增年份選擇
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_BalanceSheet(apiUrl, displayBalanceSheet, 'balanceSheetContainerJP', 'balanceSheetChartJP', period, yearRange);
}

async function fetchTWBalanceSheet() {
    const stockSymbol = await fetchTWStock();
    const period = document.getElementById('periodTW_2').value;
    const yearRange = document.getElementById('yearRangeTW_2').value;  // 新增年份選擇
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_BalanceSheet(apiUrl, displayBalanceSheet, 'balanceSheetContainerTW', 'balanceSheetChartTW', period, yearRange);
}

function fetchEUBalanceSheet() {
    const stockSymbol = fetchEUStock();
    const period = document.getElementById('period_2EU').value;
    const yearRange = document.getElementById('yearRangeEU_2').value;  // 新增年份選擇
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_BalanceSheet(apiUrl, displayBalanceSheet, 'balanceSheetContainerEU', 'balanceSheetChartEU', period, yearRange);
}

function fetchKRBalanceSheet() {
    const stockSymbol = fetchKRStock();
    const period = document.getElementById('period_2KR').value;
    const yearRange = document.getElementById('yearRangeKR_2').value;  // 新增年份選擇
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_BalanceSheet(apiUrl, displayBalanceSheet, 'balanceSheetContainerKR', 'balanceSheetChartKR', period, yearRange);
}

function fetchHKBalanceSheet() {
    const stockSymbol = fetchHKStock();
    const period = document.getElementById('period_2HK').value;
    const yearRange = document.getElementById('yearRangeHK_2').value;  // 新增年份選擇
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_BalanceSheet(apiUrl, displayBalanceSheet, 'balanceSheetContainerHK', 'balanceSheetChartHK', period, yearRange);
}

function fetchCNBalanceSheet() {
    const stockSymbol = fetchCNStock();
    const period = document.getElementById('period_2CN').value;
    const yearRange = document.getElementById('yearRangeCN_2').value;  // 新增年份選擇
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_BalanceSheet(apiUrl, displayBalanceSheet, 'balanceSheetContainerCN', 'balanceSheetChartCN', period, yearRange);
}

function fetchData_BalanceSheet(apiUrl, callback, containerId, chartId, period, yearRange) {
    const container = document.getElementById(containerId);

    // 重置状态和清理容器
    resetState(chartId, containerId);

    container.innerHTML = '<p>Loading...</p>';

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (!Array.isArray(data) || data.length === 0) {
                container.innerHTML = '<p>No data found for this symbol.</p>';
                return;
            }

            console.log('Original Data Length:', data.length);
            console.log('Year Range:', yearRange);

            // 使用传入的 yearRange 参数，并调用 updateDisplayedYears
            const filteredData = updateDisplayedYears_BS(data, container, chartId, period, yearRange);

            // 调用 displayBalanceSheet 并传入所有需要的参数
            callback(filteredData, container, chartId, period, yearRange);  // 传递过滤后的数据
        })
        .catch(error => {
            console.error('Error fetching data: ', error);
            container.innerHTML = '<p>Error loading data. Please check the console for more details.</p>';
        });
}

function updateDisplayedYears_BS(data, container, chartId, period, yearRange) {
    if (!data || !Array.isArray(data)) {
        console.error("Data is undefined or not an array");
        return [];
    }

    const currentYear = new Date().getFullYear();
    console.log("Original Data Length:", data.length);  // 确认初始数据数量
    console.log("Year Range:", yearRange);  // 确认年份范围

    const filteredData = data.filter(entry => {
        const entryYear = parseInt(entry.calendarYear);
        if (yearRange === 'all') {
            return true; // 返回所有年份的数据
        } else {
            const yearRangeInt = parseInt(yearRange);
            return currentYear - entryYear <= yearRangeInt; // 根据年份范围过滤数据
        }
    });

    console.log("Filtered Data Length:", filteredData.length);  // 确认过滤后的数据数量
    return filteredData;  // 返回过滤后的数据
}

function displayBalanceSheet(data, container, chartId, period, yearRange) {
    const currentYear = new Date().getFullYear();

    // 過濾數據以包含多兩年的數據
    const filteredDataForTable = data.filter(entry => {
        const entryYear = parseInt(entry.calendarYear);
        return yearRange === 'all' || (currentYear - entryYear <= (parseInt(yearRange) + 2)); // 表格顯示多兩年的數據
    });

    // 保持图表数据与表格数据一致
    const filteredDataForChart = filteredDataForTable;

    if (!filteredDataForTable || !Array.isArray(filteredDataForTable) || filteredDataForTable.length === 0) {
        container.innerHTML = '<p>Data not available.</p>';
        return;
    }

    // 按日期升序排序
    filteredDataForTable.sort((a, b) => new Date(a.date) - new Date(b.date));

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
        debtToAssetRate: ['Debt to Asset Rate']
    };

    filteredDataForTable.forEach((entry) => {
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

    // 創建容器結構，並綁定唯一的下載按鈕ID
    const downloadButtonId = `downloadBtn_${chartId}`;
    container.innerHTML = `
        <button id="${downloadButtonId}">Download as Excel</button>
        <div class="scroll-container-x" id="${chartId}ScrollContainer">
            <div id="${chartId}Container">
                ${tableHtml}
            </div>
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
            if (scrollContainer.scrollLeft < scrollContainer.scrollWidth - scrollContainer.clientWidth) {
                scrollContainer.scrollLeft = scrollContainer.scrollWidth;
            }
        }
    }, 100);

    // 創建圖表，僅使用篩選後的數據（刪除多出來的那一年）
    createCombinedBalanceSheetChart(filteredDataForChart, chartId);

    // 清除舊的事件並綁定新的下載按鈕事件
    bindDownloadButton_BS(rows, data[0].symbol, downloadButtonId, "Balance Sheet");
}

function bindDownloadButton_BS(rows, symbol, buttonId, sheetName) {
    setTimeout(() => {
        const downloadBtn = document.getElementById(buttonId);
        if (downloadBtn) {
            // 先移除舊的事件綁定
            downloadBtn.onclick = null;

            // 直接使用新的事件處理函數綁定
            downloadBtn.onclick = function() {
                downloadExcel_BS(rows, symbol, sheetName);
            };
        }
    }, 100);  // 延遲執行以確保 DOM 已完全更新
}

// 下载 Excel 文件的函数
function downloadExcel_BS(rows, symbol, sheetName) {
    // Check if rows is defined and not empty
    if (!rows || Object.keys(rows).length === 0) {
        alert('No data available for download.');
        return;
    }

    // Convert the rows object to an array format
    const data = Object.keys(rows).map(key => rows[key]);

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Use the stock symbol to name the file
    XLSX.writeFile(wb, `${symbol}_${sheetName.toLowerCase().replace(/ /g, '_')}.xlsx`);
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
    const yearRange = document.getElementById('yearRange_3').value;  // 获取年份范围
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/cash-flow-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_Cashflow(apiUrl, displayCashflow, 'cashflowContainer', 'cashflowChartUS', period, yearRange);
}

function fetchJPCashflow() {
    const stockSymbol = fetchJPStock();
    const period = document.getElementById('periodJP_3').value;
    const yearRange = document.getElementById('yearRangeJP_3').value;  // 获取年份范围
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/cash-flow-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_Cashflow(apiUrl, displayCashflow, 'cashflowContainerJP', 'cashflowChartJP', period, yearRange);
}

async function fetchTWCashflow() {
    const stockSymbol = await fetchTWStock();
    const period = document.getElementById('periodTW_3').value;
    const yearRange = document.getElementById('yearRangeTW_3').value;  // 获取年份范围
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/cash-flow-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_Cashflow(apiUrl, displayCashflow, 'cashflowContainerTW', 'cashflowChartTW', period, yearRange);
}

function fetchEUCashflow() {
    const stockSymbol = fetchEUStock();
    const period = document.getElementById('period_3EU').value;
    const yearRange = document.getElementById('yearRangeEU_3').value;  // 获取年份范围
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/cash-flow-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_Cashflow(apiUrl, displayCashflow, 'cashflowContainerEU', 'cashflowChartEU', period, yearRange);
}

function fetchKRCashflow() {
    const stockSymbol = fetchKRStock();
    const period = document.getElementById('period_3KR').value;
    const yearRange = document.getElementById('yearRangeKR_3').value;  // 获取年份范围
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/cash-flow-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_Cashflow(apiUrl, displayCashflow, 'cashflowContainerKR', 'cashflowChartKR', period, yearRange);
}

function fetchHKCashflow() {
    const stockSymbol = fetchHKStock();
    const period = document.getElementById('period_3HK').value;
    const yearRange = document.getElementById('yearRangeHK_3').value;  // 获取年份范围
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/cash-flow-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_Cashflow(apiUrl, displayCashflow, 'cashflowContainerHK', 'cashflowChartHK', period, yearRange);
}

function fetchCNCashflow() {
    const stockSymbol = fetchCNStock();  // 获取中国股票代码
    const period = document.getElementById('period_3CN').value;  // 获取选定的期间（年度或季度）
    const yearRange = document.getElementById('yearRangeCN_3').value;  // 获取年份范围
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/cash-flow-statement/${stockSymbol}?period=${period}&apikey=${apiKey}`;
    fetchData_Cashflow(apiUrl, displayCashflow, 'cashflowContainerCN', 'cashflowChartCN', period, yearRange);
}

function resetState_CF(chartId, containerId) {
    if (cashflowChartInstances[chartId]) {
        cashflowChartInstances[chartId].destroy();
        delete cashflowChartInstances[chartId];
    }

    // 清除容器的內容，防止殘留狀態
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '';
    }
}

function fetchData_Cashflow(apiUrl, callback, containerId, chartId, period, yearRange) {
    const container = document.getElementById(containerId);

    // 重置状态和清理容器
    resetState_CF(chartId, containerId);

    container.innerHTML = '<p>Loading...</p>';

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (!Array.isArray(data) || data.length === 0) {
                container.innerHTML = '<p>No data found for this symbol.</p>';
                return;
            }

            // 使用传入的 yearRange 参数，并调用 updateDisplayedYears_CF
            const filteredData = updateDisplayedYears_CF(data, containerId, chartId, period, yearRange);

            // 调用 displayCashflow 并传入所有需要的参数
            callback(filteredData, containerId, chartId, period, yearRange); // 确保这里传递的是 containerId
        })
        .catch(error => {
            console.error('Error fetching data: ', error);
            container.innerHTML = '<p>Error loading data. Please check the console for more details.</p>';
        });
}

function updateDisplayedYears_CF(data, container, chartId, period, yearRange) {
    if (!data || !Array.isArray(data)) {
        console.error("Data is undefined or not an array");
        return [];
    }

    const currentYear = new Date().getFullYear();
    console.log("Original Data Length:", data.length);  // 确认初始数据数量
    console.log("Year Range:", yearRange);  // 确认年份范围

    const filteredData = data.filter(entry => {
        const entryYear = parseInt(entry.calendarYear);
        if (yearRange === 'all') {
            return true; // 返回所有年份的数据
        } else {
            const yearRangeInt = parseInt(yearRange);
            return currentYear - entryYear <= yearRangeInt; // 根据年份范围过滤数据
        }
    });

    console.log("Filtered Data Length:", filteredData.length);  // 确认过滤后的数据数量
    return filteredData;  // 返回过滤后的数据
}

function displayCashflow(data, containerId, chartId, period, yearRange) {
    const currentYear = new Date().getFullYear();

    // 過濾數據以包含多兩年的數據
    const filteredDataForTable = data.filter(entry => {
        const entryYear = parseInt(entry.calendarYear);
        return yearRange === 'all' || (currentYear - entryYear <= (parseInt(yearRange) + 2)); // 表格顯示多兩年的數據
    });

    // 保持图表数据与表格数据一致
    const filteredDataForChart = filteredDataForTable;

    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container element with id ${containerId} not found.`);
        return;
    }

    if (!filteredDataForTable || !Array.isArray(filteredDataForTable) || filteredDataForTable.length === 0) {
        container.innerHTML = '<p>Data not available.</p>';
        return;
    }

    filteredDataForTable.sort((a, b) => new Date(a.date) - new Date(b.date));

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
        capexToOperatingCashFlow: ['Capex to Operating Cash Flow']
    };

    // 填充行數據
    filteredDataForTable.forEach(entry => {
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

    // 創建容器結構，並綁定唯一的下載按鈕ID
    const downloadButtonId = `downloadBtn_${chartId}`;
    container.innerHTML = `
        <button id="${downloadButtonId}">Download as Excel</button>
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
            if (scrollContainer.scrollLeft < scrollContainer.scrollWidth - scrollContainer.clientWidth) {
                scrollContainer.scrollLeft = scrollContainer.scrollWidth;
            }
        }
    }, 100);

    // 繪製圖表
    createCashflowChart(filteredDataForChart, chartId);

    // 清除舊的事件並綁定新的下載按鈕事件
    bindDownloadButton_CF(rows, data[0].symbol, downloadButtonId, "Cash Flow");
}

function bindDownloadButton_CF(rows, symbol, buttonId, sheetName) {
    setTimeout(() => {
        const downloadBtn = document.getElementById(buttonId);
        if (downloadBtn) {
            // 先移除舊的事件綁定
            downloadBtn.onclick = null;

            // 直接使用新的事件處理函數綁定
            downloadBtn.onclick = function() {
                downloadExcel_CF(rows, symbol, sheetName);
            };
        }
    }, 100);  // 延遲執行以確保 DOM 已完全更新
}

function downloadExcel_CF(rows, symbol, sheetName) {
    // Check if rows is defined and not empty
    if (!rows || Object.keys(rows).length === 0) {
        alert('No data available for download.');
        return;
    }

    // Convert the rows object to an array format
    const data = Object.keys(rows).map(key => rows[key]);

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Use the stock symbol to name the file
    XLSX.writeFile(wb, `${symbol}_${sheetName.toLowerCase().replace(/ /g, '_')}.xlsx`);
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
async function fetchEarningsCallTranscript() {
    var stockSymbol = fetchStock();
    var yearInput = document.getElementById('yearInput');
    var quarterInput = document.getElementById('quarterInput');
    var year = yearInput.value;
    var quarter = quarterInput.value;
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (stockSymbol.length === 0) {
        alert('請輸入股票代碼。');
        return;
    }

    // 如果使用者沒有輸入年份或季度，則自動抓取最新的逐字稿資料
    if (year.length === 0 || quarter.length === 0) {
        const latestApiUrl = `https://financialmodelingprep.com/api/v3/earning_call_transcript/${stockSymbol}?limit=1&apikey=${apiKey}`;
        try {
            const response = await fetch(latestApiUrl);
            const data = await response.json();
            if (data && data.length > 0) {
                year = data[0].year;
                quarter = data[0].quarter;

                // 自動填入最新的年份和季度到表單中
                yearInput.value = year;
                quarterInput.value = quarter;
            } else {
                alert('未找到最新的法說會逐字稿。');
                return;
            }
        } catch (error) {
            console.error('Error fetching latest transcript:', error);
            alert('無法獲取最新的法說會逐字稿。');
            return;
        }
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/earning_call_transcript/${stockSymbol}?year=${year}&quarter=${quarter}&apikey=${apiKey}`;
    fetchData_Transcript(apiUrl, displayEarningsCallTranscript, 'earningsCallTranscriptContainer');
}

async function fetchJPEarningsCallTranscript() {
    var stockSymbol = fetchJPStock();
    var yearInput = document.getElementById('yearInputJP');
    var quarterInput = document.getElementById('quarterInputJP');
    var year = yearInput.value;
    var quarter = quarterInput.value;
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (stockSymbol.length === 0) {
        alert('請輸入股票代碼。');
        return;
    }

    if (year.length === 0 || quarter.length === 0) {
        const latestApiUrl = `https://financialmodelingprep.com/api/v3/earning_call_transcript/${stockSymbol}?limit=1&apikey=${apiKey}`;
        try {
            const response = await fetch(latestApiUrl);
            const data = await response.json();
            if (data && data.length > 0) {
                year = data[0].year;
                quarter = data[0].quarter;

                // 填入自動取得的年份和季度
                yearInput.value = year;
                quarterInput.value = quarter;
            } else {
                alert('未找到最新的法說會逐字稿。');
                return;
            }
        } catch (error) {
            console.error('Error fetching latest transcript:', error);
            alert('無法獲取最新的法說會逐字稿。');
            return;
        }
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/earning_call_transcript/${stockSymbol}?year=${year}&quarter=${quarter}&apikey=${apiKey}`;
    fetchData_Transcript(apiUrl, displayEarningsCallTranscript, 'earningsCallTranscriptContainerJP');
}

async function fetchTWEarningsCallTranscript() {
    const stockSymbol = await fetchTWStock();
    var yearInput = document.getElementById('yearInputTW');
    var quarterInput = document.getElementById('quarterInputTW');
    var year = yearInput.value;
    var quarter = quarterInput.value;
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (stockSymbol.length === 0) {
        alert('請輸入股票代碼。');
        return;
    }

    if (year.length === 0 || quarter.length === 0) {
        const latestApiUrl = `https://financialmodelingprep.com/api/v3/earning_call_transcript/${stockSymbol}?limit=1&apikey=${apiKey}`;
        try {
            const response = await fetch(latestApiUrl);
            const data = await response.json();
            if (data && data.length > 0) {
                year = data[0].year;
                quarter = data[0].quarter;

                // 填入自動取得的年份和季度
                yearInput.value = year;
                quarterInput.value = quarter;
            } else {
                alert('未找到最新的法說會逐字稿。');
                return;
            }
        } catch (error) {
            console.error('Error fetching latest transcript:', error);
            alert('無法獲取最新的法說會逐字稿。');
            return;
        }
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/earning_call_transcript/${stockSymbol}?year=${year}&quarter=${quarter}&apikey=${apiKey}`;
    fetchData_Transcript(apiUrl, displayEarningsCallTranscript, 'earningsCallTranscriptContainerTW');
}

async function fetchEUEarningsCallTranscript() {
    const stockSymbol = fetchEUStock();
    var yearInput = document.getElementById('yearInputEU');
    var quarterInput = document.getElementById('quarterInputEU');
    var year = yearInput.value;
    var quarter = quarterInput.value;
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (stockSymbol.length === 0) {
        alert('請輸入股票代碼。');
        return;
    }

    if (year.length === 0 || quarter.length === 0) {
        const latestApiUrl = `https://financialmodelingprep.com/api/v3/earning_call_transcript/${stockSymbol}?limit=1&apikey=${apiKey}`;
        try {
            const response = await fetch(latestApiUrl);
            const data = await response.json();
            if (data && data.length > 0) {
                year = data[0].year;
                quarter = data[0].quarter;

                // 填入自動取得的年份和季度
                yearInput.value = year;
                quarterInput.value = quarter;
            } else {
                alert('未找到最新的法說會逐字稿。');
                return;
            }
        } catch (error) {
            console.error('Error fetching latest transcript:', error);
            alert('無法獲取最新的法說會逐字稿。');
            return;
        }
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/earning_call_transcript/${stockSymbol}?year=${year}&quarter=${quarter}&apikey=${apiKey}`;
    fetchData_Transcript(apiUrl, displayEarningsCallTranscript, 'earningsCallTranscriptContainerEU');
}

async function fetchKREarningsCallTranscript() {
    const stockSymbol = fetchKRStock();
    var yearInput = document.getElementById('yearInputKR');
    var quarterInput = document.getElementById('quarterInputKR');
    var year = yearInput.value;
    var quarter = quarterInput.value;
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (stockSymbol.length === 0) {
        alert('請輸入股票代碼。');
        return;
    }

    if (year.length === 0 || quarter.length === 0) {
        const latestApiUrl = `https://financialmodelingprep.com/api/v3/earning_call_transcript/${stockSymbol}?limit=1&apikey=${apiKey}`;
        try {
            const response = await fetch(latestApiUrl);
            const data = await response.json();
            if (data && data.length > 0) {
                year = data[0].year;
                quarter = data[0].quarter;

                // 填入自動取得的年份和季度
                yearInput.value = year;
                quarterInput.value = quarter;
            } else {
                alert('未找到最新的法說會逐字稿。');
                return;
            }
        } catch (error) {
            console.error('Error fetching latest transcript:', error);
            alert('無法獲取最新的法說會逐字稿。');
            return;
        }
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/earning_call_transcript/${stockSymbol}?year=${year}&quarter=${quarter}&apikey=${apiKey}`;
    fetchData_Transcript(apiUrl, displayEarningsCallTranscript, 'earningsCallTranscriptContainerKR');
}

async function fetchHKEarningsCallTranscript() {
    const stockSymbol = fetchHKStock();
    var yearInput = document.getElementById('yearInputHK');
    var quarterInput = document.getElementById('quarterInputHK');
    var year = yearInput.value;
    var quarter = quarterInput.value;
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (stockSymbol.length === 0) {
        alert('請輸入股票代碼。');
        return;
    }

    if (year.length === 0 || quarter.length === 0) {
        const latestApiUrl = `https://financialmodelingprep.com/api/v3/earning_call_transcript/${stockSymbol}?limit=1&apikey=${apiKey}`;
        try {
            const response = await fetch(latestApiUrl);
            const data = await response.json();
            if (data && data.length > 0) {
                year = data[0].year;
                quarter = data[0].quarter;

                // 填入自動取得的年份和季度
                yearInput.value = year;
                quarterInput.value = quarter;
            } else {
                alert('未找到最新的法說會逐字稿。');
                return;
            }
        } catch (error) {
            console.error('Error fetching latest transcript:', error);
            alert('無法獲取最新的法說會逐字稿。');
            return;
        }
    }

    const apiUrl = `https://financialmodelingprep.com/api/v3/earning_call_transcript/${stockSymbol}?year=${year}&quarter=${quarter}&apikey=${apiKey}`;
    fetchData_Transcript(apiUrl, displayEarningsCallTranscript, 'earningsCallTranscriptContainerHK');
}

async function fetchCNEarningsCallTranscript() {
    const stockSymbol = fetchCNStock();
    var yearInput = document.getElementById('yearInputCN');
    var quarterInput = document.getElementById('quarterInputCN');
    var year = yearInput.value;
    var quarter = quarterInput.value;
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';

    if (stockSymbol.length === 0) {
        alert('請輸入股票代碼。');
        return;
    }

    if (year.length === 0 || quarter.length === 0) {
        const latestApiUrl = `https://financialmodelingprep.com/api/v3/earning_call_transcript/${stockSymbol}?limit=1&apikey=${apiKey}`;
        try {
            const response = await fetch(latestApiUrl);
            const data = await response.json();
            if (data && data.length > 0) {
                year = data[0].year;
                quarter = data[0].quarter;

                // 填入自動取得的年份和季度
                yearInput.value = year;
                quarterInput.value = quarter;
            } else {
                alert('未找到最新的法說會逐字稿。');
                return;
            }
        } catch (error) {
            console.error('Error fetching latest transcript:', error);
            alert('無法獲取最新的法說會逐字稿。');
            return;
        }
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

    // 將日期時間顯示在逐字稿內容之前
    let transcriptDate = new Date(transcript.date).toLocaleString(); // 格式化日期時間
    let dateContent = `<p><strong>Date ：</strong> ${transcriptDate}</p>`;

    // 將逐字稿內容分段
    let paragraphs = splitTranscriptIntoParagraphs(transcript.content);

    // 組裝HTML內容
    let htmlContent = dateContent;  // 加上日期內容
    htmlContent += `<div id="transcriptPreview">${paragraphs.slice(0, 3).join('')}...</div>`;
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

async function fetchEarningsCallCalendar() {
    const stockSymbol = fetchStock();  // 獲取股票代碼
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';
    const container = document.getElementById('earningsCallCalendarContainer');

    // 顯示 "Loading..." 提示
    if (container) {
        container.innerHTML = '<p>Loading...</p>';
    }

    // 取得今天的日期
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // 計算未來三個月與六個月的日期
    const threeMonthsFuture = new Date();
    threeMonthsFuture.setMonth(today.getMonth() + 3);
    const sixMonthsFuture = new Date();
    sixMonthsFuture.setMonth(today.getMonth() + 6);

    const threeMonthsFutureStr = threeMonthsFuture.toISOString().split('T')[0];
    const sixMonthsFutureStr = sixMonthsFuture.toISOString().split('T')[0];

    // 計算過去三個月與六個月的日期
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);

    const threeMonthsAgoStr = threeMonthsAgo.toISOString().split('T')[0];
    const sixMonthsAgoStr = sixMonthsAgo.toISOString().split('T')[0];

    try {
        // 查詢未來三個月與六個月
        const futureApiUrl1 = `https://financialmodelingprep.com/api/v3/earning_calendar?symbol=${stockSymbol}&from=${todayStr}&to=${threeMonthsFutureStr}&apikey=${apiKey}`;
        const futureApiUrl2 = `https://financialmodelingprep.com/api/v3/earning_calendar?symbol=${stockSymbol}&from=${threeMonthsFutureStr}&to=${sixMonthsFutureStr}&apikey=${apiKey}`;

        const [futureResponse1, futureResponse2] = await Promise.all([
            fetch(futureApiUrl1).then(res => res.json()),
            fetch(futureApiUrl2).then(res => res.json())
        ]);

        // 查詢過去三個月與六個月
        const pastApiUrl1 = `https://financialmodelingprep.com/api/v3/earning_calendar?symbol=${stockSymbol}&from=${threeMonthsAgoStr}&to=${todayStr}&apikey=${apiKey}`;
        const pastApiUrl2 = `https://financialmodelingprep.com/api/v3/earning_calendar?symbol=${stockSymbol}&from=${sixMonthsAgoStr}&to=${threeMonthsAgoStr}&apikey=${apiKey}`;

        const [pastResponse1, pastResponse2] = await Promise.all([
            fetch(pastApiUrl1).then(res => res.json()),
            fetch(pastApiUrl2).then(res => res.json())
        ]);

        // 合併結果
        const allData = [...futureResponse1, ...futureResponse2, ...pastResponse1, ...pastResponse2];

        if (allData.length > 0) {
            displayEarningsCallCalendar(allData, 'earningsCallCalendarContainer', stockSymbol);
        } else {
            alert(`No earnings calendar data found for ${stockSymbol}.`);
        }
    } catch (error) {
        console.error('Error fetching earnings call calendar data:', error);
        alert('Unable to fetch earnings call data. Please try again later.');
    }
}

async function fetchJPEarningsCallCalendar() {
    const fromDateInput = document.getElementById('fromDateJP');
    const toDateInput = document.getElementById('toDateJP');
    const stockSymbol = fetchJPStock();
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';
    const container = document.getElementById('earningsCallCalendarContainerJP');

    if (container) {
        container.innerHTML = '<p>Loading...</p>';
    }

    if (!fromDateInput.value || !toDateInput.value) {
        const today = new Date();
        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(today.getMonth() - 6);
        const threeMonthsLater = new Date(today);
        threeMonthsLater.setMonth(today.getMonth() + 3);
        const sixMonthsLater = new Date(today);
        sixMonthsLater.setMonth(today.getMonth() + 6);

        const todayStr = today.toISOString().split('T')[0];
        const threeMonthsAgoStr = threeMonthsAgo.toISOString().split('T')[0];
        const sixMonthsAgoStr = sixMonthsAgo.toISOString().split('T')[0];
        const threeMonthsLaterStr = threeMonthsLater.toISOString().split('T')[0];
        const sixMonthsLaterStr = sixMonthsLater.toISOString().split('T')[0];

        try {
            const futureApiUrl1 = `https://financialmodelingprep.com/api/v3/earning_calendar?symbol=${stockSymbol}&from=${todayStr}&to=${threeMonthsLaterStr}&apikey=${apiKey}`;
            const futureApiUrl2 = `https://financialmodelingprep.com/api/v3/earning_calendar?symbol=${stockSymbol}&from=${threeMonthsLaterStr}&to=${sixMonthsLaterStr}&apikey=${apiKey}`;
            const pastApiUrl1 = `https://financialmodelingprep.com/api/v3/earning_calendar?symbol=${stockSymbol}&from=${threeMonthsAgoStr}&to=${todayStr}&apikey=${apiKey}`;
            const pastApiUrl2 = `https://financialmodelingprep.com/api/v3/earning_calendar?symbol=${stockSymbol}&from=${sixMonthsAgoStr}&to=${threeMonthsAgoStr}&apikey=${apiKey}`;

            const [futureResponse1, futureResponse2, pastResponse1, pastResponse2] = await Promise.all([
                fetch(futureApiUrl1), fetch(futureApiUrl2), fetch(pastApiUrl1), fetch(pastApiUrl2)
            ]);

            const futureData1 = await futureResponse1.json();
            const futureData2 = await futureResponse2.json();
            const pastData1 = await pastResponse1.json();
            const pastData2 = await pastResponse2.json();

            const allData = [...futureData1, ...futureData2, ...pastData1, ...pastData2];

            if (allData.length > 0) {
                fromDateInput.value = sixMonthsAgoStr;
                toDateInput.value = sixMonthsLaterStr;
                displayEarningsCallCalendar_JP(allData, 'earningsCallCalendarContainerJP', stockSymbol);
            } else {
                alert(`No earnings calendar data found for ${stockSymbol}.`);
            }
        } catch (error) {
            console.error('Error fetching earnings call calendar data:', error);
            alert('Unable to fetch earnings call data. Please try again later.');
        }
    } else {
        const fromDate = fromDateInput.value;
        const toDate = toDateInput.value;
        const apiUrl = `https://financialmodelingprep.com/api/v3/earning_calendar?symbol=${stockSymbol}&from=${fromDate}&to=${toDate}&apikey=${apiKey}`;
        fetchData_2(apiUrl, (data) => displayEarningsCallCalendar_JP(data, 'earningsCallCalendarContainerJP', stockSymbol), 'earningsCallCalendarContainerJP');
    }
}

async function fetchTWEarningsCallCalendar() {
    const fromDateInput = document.getElementById('fromDateTW');
    const toDateInput = document.getElementById('toDateTW');
    const stockSymbol = await fetchTWStock();
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';
    const container = document.getElementById('earningsCallCalendarContainerTW');

    if (container) {
        container.innerHTML = '<p>Loading...</p>';
    }

    if (!fromDateInput.value || !toDateInput.value) {
        const today = new Date();
        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(today.getMonth() - 6);
        const threeMonthsLater = new Date(today);
        threeMonthsLater.setMonth(today.getMonth() + 3);
        const sixMonthsLater = new Date(today);
        sixMonthsLater.setMonth(today.getMonth() + 6);

        const todayStr = today.toISOString().split('T')[0];
        const threeMonthsAgoStr = threeMonthsAgo.toISOString().split('T')[0];
        const sixMonthsAgoStr = sixMonthsAgo.toISOString().split('T')[0];
        const threeMonthsLaterStr = threeMonthsLater.toISOString().split('T')[0];
        const sixMonthsLaterStr = sixMonthsLater.toISOString().split('T')[0];

        try {
            const futureApiUrl1 = `https://financialmodelingprep.com/api/v3/earning_calendar?symbol=${stockSymbol}&from=${todayStr}&to=${threeMonthsLaterStr}&apikey=${apiKey}`;
            const futureApiUrl2 = `https://financialmodelingprep.com/api/v3/earning_calendar?symbol=${stockSymbol}&from=${threeMonthsLaterStr}&to=${sixMonthsLaterStr}&apikey=${apiKey}`;
            const pastApiUrl1 = `https://financialmodelingprep.com/api/v3/earning_calendar?symbol=${stockSymbol}&from=${threeMonthsAgoStr}&to=${todayStr}&apikey=${apiKey}`;
            const pastApiUrl2 = `https://financialmodelingprep.com/api/v3/earning_calendar?symbol=${stockSymbol}&from=${sixMonthsAgoStr}&to=${threeMonthsAgoStr}&apikey=${apiKey}`;

            const [futureResponse1, futureResponse2, pastResponse1, pastResponse2] = await Promise.all([
                fetch(futureApiUrl1), fetch(futureApiUrl2), fetch(pastApiUrl1), fetch(pastApiUrl2)
            ]);

            const futureData1 = await futureResponse1.json();
            const futureData2 = await futureResponse2.json();
            const pastData1 = await pastResponse1.json();
            const pastData2 = await pastResponse2.json();

            const allData = [...futureData1, ...futureData2, ...pastData1, ...pastData2];

            if (allData.length > 0) {
                fromDateInput.value = sixMonthsAgoStr;
                toDateInput.value = sixMonthsLaterStr;
                displayEarningsCallCalendar(allData, 'earningsCallCalendarContainerTW', stockSymbol);
            } else {
                alert(`No earnings calendar data found for ${stockSymbol}.`);
            }
        } catch (error) {
            console.error('Error fetching earnings call calendar data:', error);
            alert('Unable to fetch earnings call data. Please try again later.');
        }
    } else {
        const fromDate = fromDateInput.value;
        const toDate = toDateInput.value;
        const apiUrl = `https://financialmodelingprep.com/api/v3/earning_calendar?symbol=${stockSymbol}&from=${fromDate}&to=${toDate}&apikey=${apiKey}`;
        fetchData_2(apiUrl, (data) => displayEarningsCallCalendar(data, 'earningsCallCalendarContainerTW', stockSymbol), 'earningsCallCalendarContainerTW');
    }
}

async function fetchEUEarningsCallCalendar() {
    const fromDateInput = document.getElementById('fromDateEU');
    const toDateInput = document.getElementById('toDateEU');
    const stockSymbol = fetchEUStock();
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';
    const container = document.getElementById('earningsCallCalendarContainerEU');

    if (container) {
        container.innerHTML = '<p>Loading...</p>';
    }

    if (!fromDateInput.value || !toDateInput.value) {
        const today = new Date();
        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(today.getMonth() - 6);
        const threeMonthsLater = new Date(today);
        threeMonthsLater.setMonth(today.getMonth() + 3);
        const sixMonthsLater = new Date(today);
        sixMonthsLater.setMonth(today.getMonth() + 6);

        const todayStr = today.toISOString().split('T')[0];
        const threeMonthsAgoStr = threeMonthsAgo.toISOString().split('T')[0];
        const sixMonthsAgoStr = sixMonthsAgo.toISOString().split('T')[0];
        const threeMonthsLaterStr = threeMonthsLater.toISOString().split('T')[0];
        const sixMonthsLaterStr = sixMonthsLater.toISOString().split('T')[0];

        try {
            const futureApiUrl1 = `https://financialmodelingprep.com/api/v3/earning_calendar?symbol=${stockSymbol}&from=${todayStr}&to=${threeMonthsLaterStr}&apikey=${apiKey}`;
            const futureApiUrl2 = `https://financialmodelingprep.com/api/v3/earning_calendar?symbol=${stockSymbol}&from=${threeMonthsLaterStr}&to=${sixMonthsLaterStr}&apikey=${apiKey}`;
            const pastApiUrl1 = `https://financialmodelingprep.com/api/v3/earning_calendar?symbol=${stockSymbol}&from=${threeMonthsAgoStr}&to=${todayStr}&apikey=${apiKey}`;
            const pastApiUrl2 = `https://financialmodelingprep.com/api/v3/earning_calendar?symbol=${stockSymbol}&from=${sixMonthsAgoStr}&to=${threeMonthsAgoStr}&apikey=${apiKey}`;

            const [futureResponse1, futureResponse2, pastResponse1, pastResponse2] = await Promise.all([
                fetch(futureApiUrl1), fetch(futureApiUrl2), fetch(pastApiUrl1), fetch(pastApiUrl2)
            ]);

            const futureData1 = await futureResponse1.json();
            const futureData2 = await futureResponse2.json();
            const pastData1 = await pastResponse1.json();
            const pastData2 = await pastResponse2.json();

            const allData = [...futureData1, ...futureData2, ...pastData1, ...pastData2];

            if (allData.length > 0) {
                fromDateInput.value = sixMonthsAgoStr;
                toDateInput.value = sixMonthsLaterStr;
                displayEarningsCallCalendar(allData, 'earningsCallCalendarContainerEU', stockSymbol);
            } else {
                alert(`No earnings calendar data found for ${stockSymbol}.`);
            }
        } catch (error) {
            console.error('Error fetching earnings call calendar data:', error);
            alert('Unable to fetch earnings call data. Please try again later.');
        }
    } else {
        const fromDate = fromDateInput.value;
        const toDate = toDateInput.value;
        const apiUrl = `https://financialmodelingprep.com/api/v3/earning_calendar?symbol=${stockSymbol}&from=${fromDate}&to=${toDate}&apikey=${apiKey}`;
        fetchData_2(apiUrl, (data) => displayEarningsCallCalendar(data, 'earningsCallCalendarContainerEU', stockSymbol), 'earningsCallCalendarContainerEU');
    }
}

async function fetchKREarningsCallCalendar() {
    const fromDateInput = document.getElementById('fromDateKR');
    const toDateInput = document.getElementById('toDateKR');
    const stockSymbol = fetchKRStock();
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';
    const container = document.getElementById('earningsCallCalendarContainerKR');

    if (container) {
        container.innerHTML = '<p>Loading...</p>';
    }

    if (!fromDateInput.value || !toDateInput.value) {
        const today = new Date();
        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(today.getMonth() - 6);
        const threeMonthsLater = new Date(today);
        threeMonthsLater.setMonth(today.getMonth() + 3);
        const sixMonthsLater = new Date(today);
        sixMonthsLater.setMonth(today.getMonth() + 6);

        const todayStr = today.toISOString().split('T')[0];
        const threeMonthsAgoStr = threeMonthsAgo.toISOString().split('T')[0];
        const sixMonthsAgoStr = sixMonthsAgo.toISOString().split('T')[0];
        const threeMonthsLaterStr = threeMonthsLater.toISOString().split('T')[0];
        const sixMonthsLaterStr = sixMonthsLater.toISOString().split('T')[0];

        try {
            const futureApiUrl1 = `https://financialmodelingprep.com/api/v3/earning_calendar?symbol=${stockSymbol}&from=${todayStr}&to=${threeMonthsLaterStr}&apikey=${apiKey}`;
            const futureApiUrl2 = `https://financialmodelingprep.com/api/v3/earning_calendar?symbol=${stockSymbol}&from=${threeMonthsLaterStr}&to=${sixMonthsLaterStr}&apikey=${apiKey}`;
            const pastApiUrl1 = `https://financialmodelingprep.com/api/v3/earning_calendar?symbol=${stockSymbol}&from=${threeMonthsAgoStr}&to=${todayStr}&apikey=${apiKey}`;
            const pastApiUrl2 = `https://financialmodelingprep.com/api/v3/earning_calendar?symbol=${stockSymbol}&from=${sixMonthsAgoStr}&to=${threeMonthsAgoStr}&apikey=${apiKey}`;

            const [futureResponse1, futureResponse2, pastResponse1, pastResponse2] = await Promise.all([
                fetch(futureApiUrl1), fetch(futureApiUrl2), fetch(pastApiUrl1), fetch(pastApiUrl2)
            ]);

            const futureData1 = await futureResponse1.json();
            const futureData2 = await futureResponse2.json();
            const pastData1 = await pastResponse1.json();
            const pastData2 = await pastResponse2.json();

            const allData = [...futureData1, ...futureData2, ...pastData1, ...pastData2];

            if (allData.length > 0) {
                fromDateInput.value = sixMonthsAgoStr;
                toDateInput.value = sixMonthsLaterStr;
                displayEarningsCallCalendar(allData, 'earningsCallCalendarContainerKR', stockSymbol);
            } else {
                alert(`No earnings calendar data found for ${stockSymbol}.`);
            }
        } catch (error) {
            console.error('Error fetching earnings call calendar data:', error);
            alert('Unable to fetch earnings call data. Please try again later.');
        }
    } else {
        const fromDate = fromDateInput.value;
        const toDate = toDateInput.value;
        const apiUrl = `https://financialmodelingprep.com/api/v3/earning_calendar?symbol=${stockSymbol}&from=${fromDate}&to=${toDate}&apikey=${apiKey}`;
        fetchData_2(apiUrl, (data) => displayEarningsCallCalendar(data, 'earningsCallCalendarContainerKR', stockSymbol), 'earningsCallCalendarContainerKR');
    }
}

async function fetchHKEarningsCallCalendar() {
    const fromDateInput = document.getElementById('fromDateHK');
    const toDateInput = document.getElementById('toDateHK');
    const stockSymbol = fetchHKStock();
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';
    const container = document.getElementById('earningsCallCalendarContainerHK');

    if (container) {
        container.innerHTML = '<p>Loading...</p>';
    }

    if (!fromDateInput.value || !toDateInput.value) {
        const today = new Date();
        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(today.getMonth() - 6);
        const threeMonthsLater = new Date(today);
        threeMonthsLater.setMonth(today.getMonth() + 3);
        const sixMonthsLater = new Date(today);
        sixMonthsLater.setMonth(today.getMonth() + 6);

        const todayStr = today.toISOString().split('T')[0];
        const threeMonthsAgoStr = threeMonthsAgo.toISOString().split('T')[0];
        const sixMonthsAgoStr = sixMonthsAgo.toISOString().split('T')[0];
        const threeMonthsLaterStr = threeMonthsLater.toISOString().split('T')[0];
        const sixMonthsLaterStr = sixMonthsLater.toISOString().split('T')[0];

        try {
            const futureApiUrl1 = `https://financialmodelingprep.com/api/v3/earning_calendar?symbol=${stockSymbol}&from=${todayStr}&to=${threeMonthsLaterStr}&apikey=${apiKey}`;
            const futureApiUrl2 = `https://financialmodelingprep.com/api/v3/earning_calendar?symbol=${stockSymbol}&from=${threeMonthsLaterStr}&to=${sixMonthsLaterStr}&apikey=${apiKey}`;
            const pastApiUrl1 = `https://financialmodelingprep.com/api/v3/earning_calendar?symbol=${stockSymbol}&from=${threeMonthsAgoStr}&to=${todayStr}&apikey=${apiKey}`;
            const pastApiUrl2 = `https://financialmodelingprep.com/api/v3/earning_calendar?symbol=${stockSymbol}&from=${sixMonthsAgoStr}&to=${threeMonthsAgoStr}&apikey=${apiKey}`;

            const [futureResponse1, futureResponse2, pastResponse1, pastResponse2] = await Promise.all([
                fetch(futureApiUrl1), fetch(futureApiUrl2), fetch(pastApiUrl1), fetch(pastApiUrl2)
            ]);

            const futureData1 = await futureResponse1.json();
            const futureData2 = await futureResponse2.json();
            const pastData1 = await pastResponse1.json();
            const pastData2 = await pastResponse2.json();

            const allData = [...futureData1, ...futureData2, ...pastData1, ...pastData2];

            if (allData.length > 0) {
                fromDateInput.value = sixMonthsAgoStr;
                toDateInput.value = sixMonthsLaterStr;
                displayEarningsCallCalendar(allData, 'earningsCallCalendarContainerHK', stockSymbol);
            } else {
                alert(`No earnings calendar data found for ${stockSymbol}.`);
            }
        } catch (error) {
            console.error('Error fetching earnings call calendar data:', error);
            alert('Unable to fetch earnings call data. Please try again later.');
        }
    } else {
        const fromDate = fromDateInput.value;
        const toDate = toDateInput.value;
        const apiUrl = `https://financialmodelingprep.com/api/v3/earning_calendar?symbol=${stockSymbol}&from=${fromDate}&to=${toDate}&apikey=${apiKey}`;
        fetchData_2(apiUrl, (data) => displayEarningsCallCalendar(data, 'earningsCallCalendarContainerHK', stockSymbol), 'earningsCallCalendarContainerHK');
    }
}

async function fetchCNEarningsCallCalendar() {
    const fromDateInput = document.getElementById('fromDateCN');
    const toDateInput = document.getElementById('toDateCN');
    const stockSymbol = fetchCNStock();
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf';
    const container = document.getElementById('earningsCallCalendarContainerCN');

    if (container) {
        container.innerHTML = '<p>Loading...</p>';
    }

    if (!fromDateInput.value || !toDateInput.value) {
        const today = new Date();
        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(today.getMonth() - 6);
        const threeMonthsLater = new Date(today);
        threeMonthsLater.setMonth(today.getMonth() + 3);
        const sixMonthsLater = new Date(today);
        sixMonthsLater.setMonth(today.getMonth() + 6);

        const todayStr = today.toISOString().split('T')[0];
        const threeMonthsAgoStr = threeMonthsAgo.toISOString().split('T')[0];
        const sixMonthsAgoStr = sixMonthsAgo.toISOString().split('T')[0];
        const threeMonthsLaterStr = threeMonthsLater.toISOString().split('T')[0];
        const sixMonthsLaterStr = sixMonthsLater.toISOString().split('T')[0];

        try {
            const futureApiUrl1 = `https://financialmodelingprep.com/api/v3/earning_calendar?symbol=${stockSymbol}&from=${todayStr}&to=${threeMonthsLaterStr}&apikey=${apiKey}`;
            const futureApiUrl2 = `https://financialmodelingprep.com/api/v3/earning_calendar?symbol=${stockSymbol}&from=${threeMonthsLaterStr}&to=${sixMonthsLaterStr}&apikey=${apiKey}`;
            const pastApiUrl1 = `https://financialmodelingprep.com/api/v3/earning_calendar?symbol=${stockSymbol}&from=${threeMonthsAgoStr}&to=${todayStr}&apikey=${apiKey}`;
            const pastApiUrl2 = `https://financialmodelingprep.com/api/v3/earning_calendar?symbol=${stockSymbol}&from=${sixMonthsAgoStr}&to=${threeMonthsAgoStr}&apikey=${apiKey}`;

            const [futureResponse1, futureResponse2, pastResponse1, pastResponse2] = await Promise.all([
                fetch(futureApiUrl1), fetch(futureApiUrl2), fetch(pastApiUrl1), fetch(pastApiUrl2)
            ]);

            const futureData1 = await futureResponse1.json();
            const futureData2 = await futureResponse2.json();
            const pastData1 = await pastResponse1.json();
            const pastData2 = await pastResponse2.json();

            const allData = [...futureData1, ...futureData2, ...pastData1, ...pastData2];

            if (allData.length > 0) {
                fromDateInput.value = sixMonthsAgoStr;
                toDateInput.value = sixMonthsLaterStr;
                displayEarningsCallCalendar(allData, 'earningsCallCalendarContainerCN', stockSymbol);
            } else {
                alert(`No earnings calendar data found for ${stockSymbol}.`);
            }
        } catch (error) {
            console.error('Error fetching earnings call calendar data:', error);
            alert('Unable to fetch earnings call data. Please try again later.');
        }
    } else {
        const fromDate = fromDateInput.value;
        const toDate = toDateInput.value;
        const apiUrl = `https://financialmodelingprep.com/api/v3/earning_calendar?symbol=${stockSymbol}&from=${fromDate}&to=${toDate}&apikey=${apiKey}`;
        fetchData_2(apiUrl, (data) => displayEarningsCallCalendar(data, 'earningsCallCalendarContainerCN', stockSymbol), 'earningsCallCalendarContainerCN');
    }
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

    // 過濾股票代碼並按日期排序 (由舊到新)
    const earningsData = stockSymbol ? data.filter(item => item.symbol.toUpperCase() === stockSymbol).sort((a, b) => new Date(a.date) - new Date(b.date)) : data.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (earningsData.length === 0) {
        container.innerHTML = `<p>No earnings calendar data found for ${stockSymbol}.</p>`;
        return;
    }

    // 建立表格結構
    let rows = {
        date: ['Date'],
        symbol: ['Symbol'],
        eps: ['EPS'],
        estimatedEPS: ['Estimated EPS'],
        revenue: ['Revenue'],
        estimatedRevenue: ['Estimated Revenue']
    };

    // 填充資料
    earningsData.forEach(item => {
        rows.date.push(item.date || 'N/A');
        rows.symbol.push(item.symbol || 'N/A');
        rows.eps.push(item.eps !== null ? item.eps.toFixed(4) : 'N/A');
        rows.estimatedEPS.push(item.epsEstimated !== null ? item.epsEstimated.toFixed(4) : 'N/A');
        rows.revenue.push(item.revenue !== null ? item.revenue.toLocaleString() : 'N/A');
        rows.estimatedRevenue.push(item.revenueEstimated !== null ? item.revenueEstimated.toLocaleString() : 'N/A');
    });

    // 建立 HTML 表格，並讓表格自動適應頁面
    let tableHtml = `
    <div style="display: flex; overflow-x: auto; overflow-y: visible;">
        <!-- 左側標題欄 -->
        <div style="flex-shrink: 0; background: #1e1e1e; z-index: 1; border-right: 1px solid #000;">
            <table border="1" style="border-collapse: collapse;">
                ${Object.keys(rows).map(key => `<tr><th style="padding: 10px; background-color: #2c2c2c; border: 1px solid black;">${rows[key][0]}</th></tr>`).join('')}
            </table>
        </div>
        <!-- 右側可滾動的數據欄 -->
        <div class="scroll-right" style="overflow-x: auto; height: auto; white-space: nowrap;">
            <table border="1" style="width: 100%; border-collapse: collapse;">
                ${Object.keys(rows).map(key => `<tr>${rows[key].slice(1).map(value => `<td style="padding: 10px; background-color: #1e1e1e; border: 1px solid black;">${value}</td>`).join('')}</tr>`).join('')}
            </table>
        </div>
    </div>
    `;

    container.innerHTML = tableHtml;
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

    // 過濾股票代碼並按日期排序 (由舊到新)
    const earningsData = stockSymbol ? data.filter(item => item.symbol.toUpperCase() === stockSymbol).sort((a, b) => new Date(a.date) - new Date(b.date)) : data.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (earningsData.length === 0) {
        container.innerHTML = `<p>No earnings calendar data found for ${stockSymbol}.</p>`;
        return;
    }

    // 建立表格結構
    let rows = {
        date: ['Date'],
        symbol: ['Symbol'],
        eps: ['EPS'],
        estimatedEPS: ['Estimated EPS'],
        revenue: ['Revenue'],
        estimatedRevenue: ['Estimated Revenue']
    };

    // 填充資料
    earningsData.forEach(item => {
        rows.date.push(item.date || 'N/A');
        rows.symbol.push(item.symbol || 'N/A');
        rows.eps.push(item.eps !== null ? item.eps.toFixed(4) : 'N/A');
        rows.estimatedEPS.push(item.epsEstimated !== null ? item.epsEstimated.toFixed(4) : 'N/A');
        rows.revenue.push(item.revenue !== null ? item.revenue.toLocaleString() : 'N/A');
        rows.estimatedRevenue.push(item.revenueEstimated !== null ? item.revenueEstimated.toLocaleString() : 'N/A');
    });

    // 建立 HTML 表格，並讓表格自動適應頁面
    let tableHtml = `
    <div style="display: flex; overflow-x: auto; overflow-y: visible;">
        <!-- 左側標題欄 -->
        <div style="flex-shrink: 0; background: #1e1e1e; z-index: 1; border-right: 1px solid #000;">
            <table border="1" style="border-collapse: collapse;">
                ${Object.keys(rows).map(key => `<tr><th style="padding: 10px; background-color: #2c2c2c; border: 1px solid black;">${rows[key][0]}</th></tr>`).join('')}
            </table>
        </div>
        <!-- 右側可滾動的數據欄 -->
        <div class="scroll-right" style="overflow-x: auto; height: auto; white-space: nowrap;">
            <table border="1" style="width: 100%; border-collapse: collapse;">
                ${Object.keys(rows).map(key => `<tr>${rows[key].slice(1).map(value => `<td style="padding: 10px; background-color: #1e1e1e; border: 1px solid black;">${value}</td>`).join('')}</tr>`).join('')}
            </table>
        </div>
    </div>
    `;

    container.innerHTML = tableHtml;
}

function fetchData_2(apiUrl, callback, containerId) {
    const container = document.getElementById(containerId);

    // 顯示 "Loading..." 提示
    if (container) {
        container.innerHTML = '<p>Loading...</p>';
    }

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
                    callback(data, containerId);
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

async function fetch_historical_earning_calendar() {
    const stockSymbol = fetchStock();
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf'; // 你的 API 密鑰
    const container = document.getElementById('historicalEarningsContainer');

    if (!stockSymbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    // 顯示 "Loading..." 提示
    container.innerHTML = '<p>Loading...</p>';

    // 取得今天的日期
    const today = new Date();

    // 取得三個月前的日期
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);

    // 取得六個月前的日期
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);

    // 將日期轉換為 YYYY-MM-DD 格式
    const todayStr = today.toISOString().split('T')[0];
    const threeMonthsAgoStr = threeMonthsAgo.toISOString().split('T')[0];
    const sixMonthsAgoStr = sixMonthsAgo.toISOString().split('T')[0];

    // // 自動填入日期到 input 欄位
    // document.getElementById('fromDate_1').value = sixMonthsAgoStr;
    // document.getElementById('toDate_1').value = todayStr;

    // 進行第一次查詢（今天到三個月前）
    const firstApiUrl = `https://financialmodelingprep.com/api/v3/historical/earning_calendar/${stockSymbol}?from=${threeMonthsAgoStr}&to=${todayStr}&apikey=${apiKey}`;

    // 進行第二次查詢（三個月前到六個月前）
    const secondApiUrl = `https://financialmodelingprep.com/api/v3/historical/earning_calendar/${stockSymbol}?from=${sixMonthsAgoStr}&to=${threeMonthsAgoStr}&apikey=${apiKey}`;

    try {
        // 等待兩次 API 請求結果
        const [firstData, secondData] = await Promise.all([
            fetch(firstApiUrl).then(res => res.json()),
            fetch(secondApiUrl).then(res => res.json())
        ]);

        // 合併結果
        const allData = [...firstData, ...secondData];

        // 檢查是否有資料並顯示
        if (allData.length > 0) {
            display_historical_earning_calendar(allData, container);
        } else {
            container.innerHTML = `<p>No historical earnings data found for ${stockSymbol}.</p>`;
        }
    } catch (error) {
        console.error('Error fetching historical earnings data: ', error);
        container.innerHTML = `<p>Error loading data: ${error.message}. Please try again later.</p>`;
    }
}

function display_historical_earning_calendar(data, container) {
    // 檢查是否有資料
    if (!data || data.length === 0) {
        container.innerHTML = '<p>No data available.</p>';
        return;
    }

    // 按日期對資料進行排序（由舊到新）
    data.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 建立表格結構
    let rows = {
        date: ['Date'],
        symbol: ['Symbol'],
        eps: ['EPS'],
        estimatedEPS: ['Estimated EPS'],
        epsDifference: ['EPS 預期差異'],
        time: ['Time'],
        revenue: ['Revenue'],
        estimatedRevenue: ['Estimated Revenue'],
        revenueDifference: ['營收預期差異'],
        fiscalDateEnding: ['Fiscal Date Ending']
    };

    // 填入資料
    data.forEach(item => {
        rows.date.push(item.date || 'N/A');
        rows.symbol.push(item.symbol || 'N/A');
        rows.eps.push(item.eps != null ? item.eps : 'N/A');
        rows.estimatedEPS.push(item.epsEstimated != null ? item.epsEstimated : 'N/A');

        // 計算 EPS 差異
        if (item.eps != null && item.epsEstimated != null && item.epsEstimated !== 0) {
            const epsDifference = ((item.eps - item.epsEstimated) / item.epsEstimated * 100).toFixed(2) + '%';
            rows.epsDifference.push(epsDifference);
        } else {
            rows.epsDifference.push('N/A');
        }

        rows.time.push(item.time || 'N/A');
        rows.revenue.push(item.revenue != null ? item.revenue.toLocaleString() : 'N/A');
        rows.estimatedRevenue.push(item.revenueEstimated != null ? item.revenueEstimated.toLocaleString() : 'N/A');

        // 計算營收差異
        if (item.revenue != null && item.revenueEstimated != null && item.revenueEstimated !== 0) {
            const revenueDifference = ((item.revenue - item.revenueEstimated) / item.revenueEstimated * 100).toFixed(2) + '%';
            rows.revenueDifference.push(revenueDifference);
        } else {
            rows.revenueDifference.push('N/A');
        }

        rows.fiscalDateEnding.push(item.fiscalDateEnding || 'N/A');
    });

    // 構建 HTML 表格
    let tableHtml = `
    <div style="display: flex; overflow-x: auto; overflow-y: visible;">
        <!-- 左側標題欄 -->
        <div style="flex-shrink: 0; background: #1e1e1e; z-index: 1; border-right: 1px solid #000;">
            <table border="1" style="border-collapse: collapse;">
                ${Object.keys(rows).map(key => `<tr><th style="padding: 10px; background-color: #2c2c2c; border: 1px solid black;">${rows[key][0]}</th></tr>`).join('')}
            </table>
        </div>
        <!-- 右側可滾動的數據欄 -->
        <div class="scroll-right" style="overflow-x: auto; height: auto; white-space: nowrap;">
            <table border="1" style="width: 100%; border-collapse: collapse;">
                ${Object.keys(rows).map(key => `<tr>${rows[key].slice(1).map(value => `<td style="padding: 10px; background-color: #1e1e1e; border: 1px solid black; white-space: nowrap;">${value}</td>`).join('')}</tr>`).join('')}
            </table>
        </div>
    </div>
    `;

    container.innerHTML = tableHtml;
}

async function fetchData_historical_earning_calendar(apiUrl, callback, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '<p>Loading...</p>';

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.error) {
            container.innerHTML = `<p>Error loading data: ${data.error}</p>`;
        } else {
            callback(data, container);
        }
    } catch (error) {
        console.error('Error fetching data: ', error);
        container.innerHTML = '<p>Error loading data. Please check the console for more details.</p>';
    }
}


//////////////股利發放日期/////////////////
async function fetch_stock_dividend_calendar() {
    const fromDateInput = document.getElementById('fromDate_2').value;
    const toDateInput = document.getElementById('toDate_2').value;
    const apiKey = 'GXqcokYeRt6rTqe8cpcUxGPiJhnTIzkf'; // 请替换成您的 API 密钥
    const container = document.getElementById('stockDividendCalendarContainer');
    const stockSymbol = fetchStock(); // 获取当前用户正在查询的股票代碼

    // 顯示 "Loading..." 提示
    if (container) {
        container.innerHTML = '<p>Loading...</p>';
    }

    // 取得今天的日期
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // 計算過去三個月、六個月、九個月的日期
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    const nineMonthsAgo = new Date();
    nineMonthsAgo.setMonth(today.getMonth() - 9);

    const threeMonthsAgoStr = threeMonthsAgo.toISOString().split('T')[0];
    const sixMonthsAgoStr = sixMonthsAgo.toISOString().split('T')[0];
    const nineMonthsAgoStr = nineMonthsAgo.toISOString().split('T')[0];

    // 計算未來三個月、六個月的日期
    const threeMonthsFuture = new Date();
    threeMonthsFuture.setMonth(today.getMonth() + 3);
    const sixMonthsFuture = new Date();
    sixMonthsFuture.setMonth(today.getMonth() + 6);

    const threeMonthsFutureStr = threeMonthsFuture.toISOString().split('T')[0];
    const sixMonthsFutureStr = sixMonthsFuture.toISOString().split('T')[0];

    // 如果使用者沒有填寫日期，自動設置日期範圍
    const fromDate = fromDateInput || nineMonthsAgoStr;
    const toDate = toDateInput || sixMonthsFutureStr;

    try {
        let allData = [];

        if (!fromDateInput && !toDateInput) {
            // 自動查詢過去9個月和未來6個月，每3個月查詢一次
            const pastApiUrl1 = `https://financialmodelingprep.com/api/v3/stock_dividend_calendar?from=${nineMonthsAgoStr}&to=${sixMonthsAgoStr}&apikey=${apiKey}`;
            const pastApiUrl2 = `https://financialmodelingprep.com/api/v3/stock_dividend_calendar?from=${sixMonthsAgoStr}&to=${threeMonthsAgoStr}&apikey=${apiKey}`;
            const pastApiUrl3 = `https://financialmodelingprep.com/api/v3/stock_dividend_calendar?from=${threeMonthsAgoStr}&to=${todayStr}&apikey=${apiKey}`;

            const futureApiUrl1 = `https://financialmodelingprep.com/api/v3/stock_dividend_calendar?from=${todayStr}&to=${threeMonthsFutureStr}&apikey=${apiKey}`;
            const futureApiUrl2 = `https://financialmodelingprep.com/api/v3/stock_dividend_calendar?from=${threeMonthsFutureStr}&to=${sixMonthsFutureStr}&apikey=${apiKey}`;

            // 並行請求多個時間段的數據
            const [pastResponse1, pastResponse2, pastResponse3, futureResponse1, futureResponse2] = await Promise.all([
                fetch(pastApiUrl1).then(res => res.json()),
                fetch(pastApiUrl2).then(res => res.json()),
                fetch(pastApiUrl3).then(res => res.json()),
                fetch(futureApiUrl1).then(res => res.json()),
                fetch(futureApiUrl2).then(res => res.json())
            ]);

            // 合併所有數據
            allData = [...pastResponse1, ...pastResponse2, ...pastResponse3, ...futureResponse1, ...futureResponse2];
        } else {
            // 查詢選定範圍的股息數據
            const apiUrl = `https://financialmodelingprep.com/api/v3/stock_dividend_calendar?from=${fromDate}&to=${toDate}&apikey=${apiKey}`;
            const response = await fetch(apiUrl);
            allData = await response.json();
        }

        // 過濾符合當前股票代碼的數據
        const filteredData = allData.filter(item => item.symbol.toUpperCase() === stockSymbol.toUpperCase());

        if (filteredData.length > 0) {
            display_stock_dividend_calendar(filteredData, container);
        } else {
            container.innerHTML = `<p>No dividend calendar data found for the stock ${stockSymbol} in the selected date range.</p>`;
        }
    } catch (error) {
        console.error('Error fetching stock dividend calendar data:', error);
        alert('Unable to fetch stock dividend data. Please try again later.');
    }
}

function display_stock_dividend_calendar(data, container) {
    stockSymbol = fetchStock();
    if (!data || data.length === 0) {
        container.innerHTML = '<p>No data available for the selected dates.</p>';
        return;
    }

    // 根據日期進行排序，從早到晚
    data.sort((a, b) => new Date(a.date) - new Date(b.date));

    let rows = {
        date: ['Date'],
        label: ['Label'],
        symbol: ['Symbol'],
        dividend: ['Dividend'],
        adjDividend: ['Adjusted Dividend'],
        declarationDate: ['Declaration Date'],
        recordDate: ['Record Date'],
        paymentDate: ['Payment Date']
    };

    // 填充行數據，並只添加符合輸入的股票代碼的行
    data.forEach(item => {
        rows.date.push(item.date || 'N/A');
        rows.label.push(item.label || 'N/A');
        rows.symbol.push(item.symbol || 'N/A');
        rows.dividend.push(item.dividend != null ? item.dividend : 'N/A');
        rows.adjDividend.push(item.adjDividend != null ? item.adjDividend : 'N/A');
        rows.declarationDate.push(item.declarationDate || 'N/A');
        rows.recordDate.push(item.recordDate || 'N/A');
        rows.paymentDate.push(item.paymentDate || 'N/A');
    });

    // 構建 HTML 表格，使用 white-space: nowrap; 防止內容換行
    let tableHtml = `
    <div style="display: flex; overflow-x: auto;">
        <div style="flex-shrink: 0; background: #1e1e1e; z-index: 1; border-right: 1px solid #000;">
            <table border="1" style="border-collapse: collapse; table-layout: fixed; white-space: nowrap;">
                ${Object.keys(rows).map(key => `<tr><th style="white-space: nowrap; width: 150px;">${rows[key][0]}</th></tr>`).join('')}
            </table>
        </div>
        <div class="scroll-right" style="overflow-x: auto;">
            <table border="1" style="width: 100%; border-collapse: collapse; table-layout: fixed; white-space: nowrap;">
                ${Object.keys(rows).map(key => `<tr>${rows[key].slice(1).map(value => `
                <td style="white-space: nowrap; width: 150px; overflow: hidden; text-overflow: ellipsis;">${value}</td>`).join('')}</tr>`).join('')}
            </table>
        </div>
    </div>
    `;

    container.innerHTML = tableHtml;
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

    // 將資料根據 filingDate 由舊到新排序
    data.sort((a, b) => new Date(a.filingDate) - new Date(b.filingDate));

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

    // 填充行數據
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

    // 構建 HTML 表格，使用 white-space: nowrap; 防止內容換行
    let tableHtml = `
    <div style="display: flex; overflow-x: auto;">
        <div style="flex-shrink: 0; background: #1e1e1e; z-index: 1; border-right: 1px solid #000;">
            <table border="1" style="border-collapse: collapse; white-space: nowrap;">
                ${Object.keys(rows).map(key => `<tr><th style="white-space: nowrap;">${rows[key][0]}</th></tr>`).join('')}
            </table>
        </div>
        <div class="scroll-right" style="overflow-x: auto;">
            <table border="1" style="width: 100%; border-collapse: collapse; white-space: nowrap;">
                ${Object.keys(rows).map(key => `<tr>${rows[key].slice(1).map(value => `<td style="white-space: nowrap;">${value}</td>`).join('')}</tr>`).join('')}
            </table>
        </div>
    </div>
    `;

    container.innerHTML = tableHtml;
}


////////////////////////////錄音檔轉文字/////////////////////////////
let originalFileNames = {};
let currentOriginalFileName = '';
let pollingInterval;

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