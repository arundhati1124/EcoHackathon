// Global variables
let monthlyIncome = 0;
let expenses = [];
let savingsGoal = 0;
let goalDescription = '';
let goalReward = '';
let emergencyFund = 0;
let bankBalance = 0;
let deposits = [];
let stocks = [];
let expenseChart = null;
let currentTab = 'overview';

// Category mappings for 50/30/20 rule
const categoryMappings = {
    // Needs (50%)
    housing: 'needs',
    utilities: 'needs',
    groceries: 'needs',
    transportation: 'needs',
    healthcare: 'needs',
    insurance: 'needs',
    // Wants (30%)
    entertainment: 'wants',
    dining: 'wants',
    shopping: 'wants',
    hobbies: 'wants',
    subscriptions: 'wants',
    // Savings (20%)
    savings: 'savings',
    investments: 'savings',
    debt: 'savings'
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    updateDisplay();
    updateEmergencyFundStatus();
    initializeSliders();
});

// Tab switching
function switchTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Show selected tab content
    const selectedTab = document.getElementById(tabName + '-tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to selected tab (find the clicked tab)
    const clickedTab = Array.from(tabs).find(tab => 
        tab.textContent.toLowerCase().includes(tabName.toLowerCase())
    );
    if (clickedTab) {
        clickedTab.classList.add('active');
    }
    
    currentTab = tabName;
    
    // Update chart if switching to analysis tab
    if (tabName === 'analysis') {
        setTimeout(() => updateExpenseChart(), 100);
    }
}

// Save data to memory (localStorage replacement)
function saveData() {
    window.budgetData = {
        monthlyIncome,
        expenses,
        savingsGoal,
        goalDescription,
        goalReward,
        emergencyFund,
        bankBalance,
        deposits,
        stocks
    };
}

// Load data from memory
function loadData() {
    if (window.budgetData) {
        const data = window.budgetData;
        monthlyIncome = data.monthlyIncome || 0;
        expenses = data.expenses || [];
        savingsGoal = data.savingsGoal || 0;
        goalDescription = data.goalDescription || '';
        goalReward = data.goalReward || '';
        emergencyFund = data.emergencyFund || 0;
        bankBalance = data.bankBalance || 0;
        deposits = data.deposits || [];
        stocks = data.stocks || [];
        
        // Update input fields
        const incomeInput = document.getElementById('monthly-income');
        const goalInput = document.getElementById('savings-goal');
        const descInput = document.getElementById('goal-description');
        const rewardInput = document.getElementById('goal-reward');
        const bankInput = document.getElementById('bank-balance');
        
        if (incomeInput) incomeInput.value = monthlyIncome;
        if (goalInput) goalInput.value = savingsGoal;
        if (descInput) descInput.value = goalDescription;
        if (rewardInput) rewardInput.value = goalReward;
        if (bankInput) bankInput.value = bankBalance;
    }
}
// (bank savings + stock gains)
function calculateAvailableSavings() {
    const bankSavings = Math.max(0, bankBalance - emergencyFund);
    
  
    const stockGains = stocks.reduce((total, stock) => {
        return total + Math.max(0, stock.gainLoss);
    }, 0);
    
    return bankSavings + stockGains;
}

// Update income
function updateIncome() {
    const incomeInput = document.getElementById('monthly-income');
    if (incomeInput) {
        const income = parseFloat(incomeInput.value) || 0;
        monthlyIncome = income;
        saveData();
        updateDisplay();
        updateEmergencyFundStatus();
    }
}

// Update bank balance
function updateBankBalance() {
    const balanceInput = document.getElementById('bank-balance');
    if (balanceInput) {
        const balance = parseFloat(balanceInput.value) || 0;
        bankBalance = balance;
        saveData();
        updateBankDisplay();
        updateDisplay();
    }
}

// Update bank display
function updateBankDisplay() {
    const balanceDisplay = document.getElementById('current-balance');
    if (balanceDisplay) {
        balanceDisplay.textContent = `$${bankBalance.toFixed(2)}`;
    }
}

// Add expense
function addExpense() {
    const categorySelect = document.getElementById('expense-category');
    const amountInput = document.getElementById('expense-amount');
    
    if (categorySelect && amountInput) {
        const category = categorySelect.value;
        const amount = parseFloat(amountInput.value) || 0;
        
        if (amount > 0) {
            expenses.push({ 
                category, 
                amount,
                type: categoryMappings[category] || 'wants',
                date: new Date().toISOString().split('T')[0]
            });
            amountInput.value = '';
            saveData();
            updateDisplay();
            updateExpenseList();
            updateCategoryStatus();
        }
    }
}

// Delete expense
function deleteExpense(index) {
    if (index >= 0 && index < expenses.length) {
        expenses.splice(index, 1);
        saveData();
        updateDisplay();
        updateExpenseList();
        updateCategoryStatus();
    }
}

// Update expense list display
function updateExpenseList() {
    const list = document.getElementById('expense-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    expenses.forEach((expense, index) => {
        const item = document.createElement('div');
        item.className = 'expense-item';
        item.innerHTML = `
            <div>
                <span class="expense-category">${getCategoryIcon(expense.category)} ${expense.category}</span>
                <small style="display: block; color: #666;">${expense.type}</small>
            </div>
            <div>
                <span class="expense-amount">$${expense.amount.toFixed(2)}</span>
                <button class="delete-btn" onclick="deleteExpense(${index})">×</button>
            </div>
        `;
        list.appendChild(item);
    });
}

// Get category icon
function getCategoryIcon(category) {
    const icons = {
        housing: '🏠',
        utilities: '⚡',
        groceries: '🛒',
        transportation: '🚗',
        healthcare: '🏥',
        insurance: '🛡️',
        entertainment: '🎬',
        dining: '🍽️',
        shopping: '🛍️',
        hobbies: '🎨',
        subscriptions: '📺',
        savings: '💰',
        investments: '📈',
        debt: '💳'
    };
    return icons[category] || '📦';
}
//

// Set savings goal
function setSavingsGoal() {
    const goalInput = document.getElementById('savings-goal');
    const descInput = document.getElementById('goal-description');
    const rewardInput = document.getElementById('goal-reward');
    
    if (goalInput) savingsGoal = parseFloat(goalInput.value) || 0;
    if (descInput) goalDescription = descInput.value || '';
    if (rewardInput) goalReward = rewardInput.value || '';
    
    saveData();
    updateDisplay();
}

// Add deposit
function addDeposit() {
    const amountInput = document.getElementById('deposit-amount');
    const rateInput = document.getElementById('interest-rate');
    const termInput = document.getElementById('deposit-term');
    const typeSelect = document.getElementById('deposit-type');
    
    if (amountInput && rateInput && termInput && typeSelect) {
        const amount = parseFloat(amountInput.value) || 0;
        const rate = parseFloat(rateInput.value) || 0;
        const term = parseFloat(termInput.value) || 0;
        const type = typeSelect.value;
        
        if (amount > 0 && rate > 0 && term > 0) {
            const maturityValue = amount * Math.pow(1 + (rate / 100), term);
            const interest = maturityValue - amount;
            
            deposits.push({
                amount,
                rate,
                term,
                type,
                maturityValue,
                interest,
                date: new Date().toISOString().split('T')[0]
            });
            
            // Clear inputs
            amountInput.value = '';
            rateInput.value = '';
            termInput.value = '';
            
            saveData();
            updateDepositsDisplay();
        }
    }
}

// Update deposits display
function updateDepositsDisplay() {
    const container = document.getElementById('deposits-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    deposits.forEach((deposit, index) => {
        const item = document.createElement('div');
        item.className = 'deposit-item';
        item.style.cssText = 'border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 8px; background: #f9f9f9;';
        item.innerHTML = `
            <div style="display: flex; justify-content: between; align-items: start;">
                <div>
                    <strong>${deposit.type}</strong><br>
                    <small>Principal: $${deposit.amount.toFixed(2)}</small><br>
                    <small>Rate: ${deposit.rate}% for ${deposit.term} years</small><br>
                    <small>Maturity Value: $${deposit.maturityValue.toFixed(2)}</small><br>
                    <small>Interest Earned: $${deposit.interest.toFixed(2)}</small>
                </div>
                <button onclick="deleteDeposit(${index})" style="background: #f44336; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Delete</button>
            </div>
        `;
        container.appendChild(item);
    });
}

// Delete deposit
function deleteDeposit(index) {
    if (index >= 0 && index < deposits.length) {
        deposits.splice(index, 1);
        saveData();
        updateDepositsDisplay();
    }
}

// Add stock
function addStock() {
    const symbolInput = document.getElementById('stock-symbol');
    const sharesInput = document.getElementById('stock-shares');
    const priceInput = document.getElementById('stock-price');
    const currentInput = document.getElementById('stock-current-price');
    
    if (symbolInput && sharesInput && priceInput && currentInput) {
        const symbol = symbolInput.value.toUpperCase() || '';
        const shares = parseFloat(sharesInput.value) || 0;
        const price = parseFloat(priceInput.value) || 0;
        const currentPrice = parseFloat(currentInput.value) || 0;
        
        if (symbol && shares > 0 && price > 0 && currentPrice > 0) {
            const totalInvested = shares * price;
            const currentValue = shares * currentPrice;
            const gainLoss = currentValue - totalInvested;
            const returnPercent = ((gainLoss / totalInvested) * 100);
            
            stocks.push({
                symbol,
                shares,
                price,
                currentPrice,
                totalInvested,
                currentValue,
                gainLoss,
                returnPercent,
                date: new Date().toISOString().split('T')[0]
            });
            
            // Clear inputs
            symbolInput.value = '';
            sharesInput.value = '';
            priceInput.value = '';
            currentInput.value = '';
            
            saveData();
            updateStocksDisplay();
            
        }
    }
}

// Update stocks display
function updateStocksDisplay() {
    const container = document.getElementById('stocks-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    let totalInvested = 0;
    let totalValue = 0;
    
    stocks.forEach((stock, index) => {
        totalInvested += stock.totalInvested;
        totalValue += stock.currentValue;
        
        const item = document.createElement('div');
        item.className = 'stock-item';
        item.style.cssText = 'border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 8px; background: #f9f9f9;';
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <strong>${stock.symbol}</strong> (${stock.shares} shares)<br>
                    <small>Purchase: $${stock.price.toFixed(2)} | Current: $${stock.currentPrice.toFixed(2)}</small><br>
                    <small>Invested: $${stock.totalInvested.toFixed(2)} | Value: $${stock.currentValue.toFixed(2)}</small><br>
                    <small style="color: ${stock.gainLoss >= 0 ? 'green' : 'red'};">
                        ${stock.gainLoss >= 0 ? '+' : ''}$${stock.gainLoss.toFixed(2)} (${stock.returnPercent >= 0 ? '+' : ''}${stock.returnPercent.toFixed(2)}%)
                    </small>
                </div>
                <button onclick="deleteStock(${index})" style="background: #f44336; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Delete</button>
            </div>
        `;
        container.appendChild(item);
    });
    
    // Update portfolio summary
    const totalGainLoss = totalValue - totalInvested;
    const portfolioReturn = totalInvested > 0 ? ((totalGainLoss / totalInvested) * 100) : 0;
    
    const totalInvestmentEl = document.getElementById('total-investment');
    const totalValueEl = document.getElementById('total-value');
    const totalGainLossEl = document.getElementById('total-gain-loss');
    const portfolioReturnEl = document.getElementById('portfolio-return');
    
    if (totalInvestmentEl) totalInvestmentEl.textContent = `$${totalInvested.toFixed(2)}`;
    if (totalValueEl) totalValueEl.textContent = `$${totalValue.toFixed(2)}`;
    if (totalGainLossEl) {
        totalGainLossEl.textContent = `${totalGainLoss >= 0 ? '+' : ''}$${totalGainLoss.toFixed(2)}`;
        totalGainLossEl.style.color = totalGainLoss >= 0 ? 'green' : 'red';
    }
    if (portfolioReturnEl) {
        portfolioReturnEl.textContent = `${portfolioReturn >= 0 ? '+' : ''}${portfolioReturn.toFixed(2)}%`;
        portfolioReturnEl.style.color = portfolioReturn >= 0 ? 'green' : 'red';
    }
}

// Delete stock
function deleteStock(index) {
    if (index >= 0 && index < stocks.length) {
        stocks.splice(index, 1);
        saveData();
        updateStocksDisplay();
        updateDisplay();
    }
}

// Toggle collapsible sections
function toggleCollapsible(button) {
    const content = button.nextElementSibling;
    if (content.classList.contains('active')) {
        content.classList.remove('active');
        button.classList.remove('active');
    } else {
        content.classList.add('active');
        button.classList.add('active');
    }
}


// Update all displays
function updateDisplay() {
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const monthlySavings = monthlyIncome - totalExpenses;
    const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

    // 50/30/20 
    const needsTarget = monthlyIncome * 0.5;
    const wantsTarget = monthlyIncome * 0.3;
    const savingsTarget = monthlyIncome * 0.2;

    const needsEl = document.getElementById('needs-amount');
    const wantsEl = document.getElementById('wants-amount');
    const savingsEl = document.getElementById('savings-amount');
    
    if (needsEl) needsEl.textContent = `$${needsTarget.toFixed(0)}`;
    if (wantsEl) wantsEl.textContent = `$${wantsTarget.toFixed(0)}`;
    if (savingsEl) savingsEl.textContent = `$${savingsTarget.toFixed(0)}`;

    // Update stats
    const totalIncomeEl = document.getElementById('total-income');
    const totalExpensesEl = document.getElementById('total-expenses');
    const monthlySavingsEl = document.getElementById('monthly-savings');
    const savingsRateEl = document.getElementById('savings-rate');
   // const bankBalance1 = document.getElementById('bank-balance');

    if (totalIncomeEl) totalIncomeEl.textContent = `$${monthlyIncome.toFixed(2)}`;
    if (totalExpensesEl) totalExpensesEl.textContent = `$${totalExpenses.toFixed(2)}`;
    if (monthlySavingsEl) monthlySavingsEl.textContent = `$${monthlySavings.toFixed(2)}`;
    if (savingsRateEl) savingsRateEl.textContent = `${savingsRate.toFixed(1)}%`;

    // Update goal progress
    updateGoalProgress(monthlySavings);
    
    // Update expense chart
    updateExpenseChart();
    
    // Update expense list
    updateExpenseList();
    
    // Generate insights
    generateInsights(monthlyIncome, totalExpenses, monthlySavings);
    
    // Update category status
    updateCategoryStatus();
    
    // Update bank display
    updateBankDisplay();
    
    // Update deposits and stocks
    updateDepositsDisplay();
    updateStocksDisplay();
}

//50/30/20 tracking
function updateCategoryStatus() {
    const container = document.getElementById('category-status');
    if (!container) return;

    const needsTarget = monthlyIncome * 0.5;
    const wantsTarget = monthlyIncome * 0.3;
    const savingsTarget = monthlyIncome * 0.2;

    // Calculate actual spending by category
    const needsSpent = expenses.filter(e => e.type === 'needs').reduce((sum, e) => sum + e.amount, 0);
    const wantsSpent = expenses.filter(e => e.type === 'wants').reduce((sum, e) => sum + e.amount, 0);
    const savingsSpent = expenses.filter(e => e.type === 'savings').reduce((sum, e) => sum + e.amount, 0);

    container.innerHTML = `
        <div class="category-budget" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; margin: 10px 0; border-radius: 8px; background: ${needsSpent > needsTarget ? '#ffebee' : '#e8f5e8'}; border: 1px solid ${needsSpent > needsTarget ? '#f44336' : '#4CAF50'};">
            <div>
                <strong>🏠 Needs (50%)</strong>
                <div>Spent: $${needsSpent.toFixed(2)} / Budget: $${needsTarget.toFixed(2)}</div>
            </div>
            <div style="text-align: right;">
                <strong>${needsTarget > 0 ? ((needsSpent / needsTarget) * 100).toFixed(1) : 0}%</strong>
                <div style="color: ${needsSpent > needsTarget ? '#f44336' : '#4CAF50'};">
                    ${needsSpent > needsTarget ? 'Over Budget' : 'On Track'}
                </div>
            </div>
        </div>

        <div class="category-budget" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; margin: 10px 0; border-radius: 8px; background: ${wantsSpent > wantsTarget ? '#ffebee' : '#e8f5e8'}; border: 1px solid ${wantsSpent > wantsTarget ? '#f44336' : '#4CAF50'};">
            <div>
                <strong>🎬 Wants (30%)</strong>
                <div>Spent: $${wantsSpent.toFixed(2)} / Budget: $${wantsTarget.toFixed(2)}</div>
            </div>
            <div style="text-align: right;">
                <strong>${wantsTarget > 0 ? ((wantsSpent / wantsTarget) * 100).toFixed(1) : 0}%</strong>
                <div style="color: ${wantsSpent > wantsTarget ? '#f44336' : '#4CAF50'};">
                    ${wantsSpent > wantsTarget ? 'Over Budget' : 'On Track'}
                </div>
            </div>
        </div>

        <div class="category-budget" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; margin: 10px 0; border-radius: 8px; background: ${savingsSpent < savingsTarget ? '#ffebee' : '#e8f5e8'}; border: 1px solid ${savingsSpent < savingsTarget ? '#f44336' : '#4CAF50'};">
            <div>
                <strong>💰 Savings (20%)</strong>
                <div>Saved: $${savingsSpent.toFixed(2)} / Target: $${savingsTarget.toFixed(2)}</div>
            </div>
            <div style="text-align: right;">
                <strong>${savingsTarget > 0 ? ((savingsSpent / savingsTarget) * 100).toFixed(1) : 0}%</strong>
                <div style="color: ${savingsSpent < savingsTarget ? '#f44336' : '#4CAF50'};">
                    ${savingsSpent < savingsTarget ? 'Below Target' : 'Great!'}
                </div>
            </div>
        </div>
    `;
}


// Update goal progress
function updateGoalProgress(monthlySavings) {
    const goalSection = document.getElementById('goal-progress');
    const progressFill = document.getElementById('progress-fill');
    const timeline = document.getElementById('goal-timeline');
    
    if (!goalSection) return;
    
    if (savingsGoal > 0) {
        goalSection.style.display = 'block';
        
        const availableSavings = calculateAvailableSavings();
        
        const progressPercent = Math.min((availableSavings / savingsGoal) * 100, 100);

        const remainingAmount = Math.max(0, savingsGoal - availableSavings);
        
        if (progressFill) progressFill.style.width = `${progressPercent}%`;
        
        if (timeline) {
            let timelineContent = `
                <strong>${goalDescription || 'Your Goal'}</strong><br>
                💰 Target: $${savingsGoal.toFixed(2)}<br>
                💳 Available Savings: $${availableSavings.toFixed(2)}<br>
                📊 Progress: ${progressPercent.toFixed(1)}%<br>
            `;
            
            if (remainingAmount > 0) {
                if (monthlySavings > 0) {
                    const monthsToGoal = Math.ceil(remainingAmount / monthlySavings);
                    timelineContent += `📅 Remaining: $${remainingAmount.toFixed(2)} (${monthsToGoal} months at current rate)<br>`;
                } else {
                    timelineContent += `⚠️ Need $${remainingAmount.toFixed(2)} more. Consider increasing monthly savings.<br>`;
                }
            } else {
                timelineContent += `🎉 <strong style="color: #4CAF50;">Goal Achieved!</strong><br>`;
            }
            
            if (goalReward) {
                timelineContent += `🎁 Reward: ${goalReward}`;
            }
            
            // Add breakdown of available savings
            const bankSavings = Math.max(0, bankBalance - emergencyFund);
            const stockGains = stocks.reduce((total, stock) => total + Math.max(0, stock.gainLoss), 0);
            
            if (bankSavings > 0 || stockGains > 0) {
                timelineContent += `<br><br><small style="color: #666;">
                    Breakdown: Bank Savings: $${bankSavings.toFixed(2)} | Stock Gains: $${stockGains.toFixed(2)}
                </small>`;
            }
            
            timeline.innerHTML = timelineContent;
        }
    } else {
        goalSection.style.display = 'none';
    }
}
// Update expense chart
function updateExpenseChart() {
    const ctx = document.getElementById('expenseChart');
    if (!ctx) return;
    
    if (expenseChart) {
        expenseChart.destroy();
        expenseChart = null;
    }

    if (expenses.length === 0) return;

    const categoryTotals = {};
    expenses.forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
        '#9966FF', '#FF9F40', '#FF6384', '#36A2EB',
        '#4CAF50', '#FFC107', '#E91E63', '#00BCD4'
    ];

    try {
        expenseChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels.map(label => getCategoryIcon(label) + ' ' + label),
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating chart:', error);
    }
}

  const apiKey = "91MEGZTUH03AGAJ6";

  function toggleStockTable() {
    const section = document.getElementById("stock-table-section");
    section.style.display = section.style.display === "none" ? "block" : "none";
  }

  function searchStock() {
    const symbol = document.getElementById("stock-search").value.toUpperCase();
    const tbody = document.getElementById("stock-table-body");
    
    if (!symbol) {
      alert("Please enter a stock symbol to search.");
      return;
    }

    tbody.innerHTML = "<tr><td colspan='5'>Searching...</td></tr>";

    fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`)
      .then(res => res.json())
      .then(data => {
        const q = data["Global Quote"];
        if (!q || !q["01. symbol"]) {
          tbody.innerHTML = `<tr><td colspan="5">Stock not found.</td></tr>`;
          return;
        }
        tbody.innerHTML = `
          <tr>
            <td>${q["01. symbol"]}</td>
            <td>${q["05. price"]}</td>
            <td>${q["03. high"]}</td>
            <td>${q["04. low"]}</td>
            <td>${q["10. change percent"]}</td>
          </tr>`;
      })
      .catch(error => {
        console.error("Error fetching stock data:", error);
        tbody.innerHTML = `<tr><td colspan="5">Error fetching data.</td></tr>`;
      });
  }

//collapsible
function toggleCollapsible(element) {
    element.classList.toggle("active");
    const content = element.nextElementSibling;
    content.classList.toggle("active");
}
// What-if analysis
function updateWhatIf() {
    const incomeSlider = document.getElementById('income-slider');
    const expenseSlider = document.getElementById('expense-slider');
    const incomeValue = document.getElementById('income-value');
    const expenseValue = document.getElementById('expense-value');
    const results = document.getElementById('what-if-results');
    
    if (!incomeSlider || !expenseSlider || !results) return;
    
    const incomeChange = parseInt(incomeSlider.value);
    const expenseChange = parseInt(expenseSlider.value);
    
    if (incomeValue) incomeValue.textContent = `${incomeChange > 0 ? '+' : ''}${incomeChange}%`;
    if (expenseValue) expenseValue.textContent = `${expenseChange > 0 ? '+' : ''}${expenseChange}%`;
    
    const newIncome = monthlyIncome * (1 + incomeChange / 100);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const newExpenses = totalExpenses * (1 + expenseChange / 100);
    const newSavings = newIncome - newExpenses;
    const currentSavings = monthlyIncome - totalExpenses;
    const savingsDifference = newSavings - currentSavings;
    
    let newGoalTimeline = '';
    if (savingsGoal>0) {
        const monthsToGoal = Math.ceil(savingsGoal / newSavings);
        newGoalTimeline = `<br>🎯 New goal timeline: ${monthsToGoal} months`;
    }
    
    results.innerHTML = `
        <h5>Projected Results:</h5>
        <p><strong>New Monthly Income:</strong> $${newIncome.toFixed(2)}</p>
        <p><strong>New Monthly Expenses:</strong> $${newExpenses.toFixed(2)}</p>
        <p><strong>New Monthly Savings:</strong> $${newSavings.toFixed(2)}</p>
        <p><strong>Savings Change:</strong> <span style="color: ${savingsDifference >= 0 ? 'green' : 'red'}">
            ${savingsDifference >= 0 ? '+' : ''}$${savingsDifference.toFixed(2)}</span></p>
        ${newGoalTimeline}
        <div style="margin-top: 15px; padding: 15px; background: #f0f8ff; border-radius: 8px;">
            <strong>💡 Action Items:</strong><br>
            ${savingsDifference > 0 ? 
                '✅ This change would improve your financial position!' : 
                '⚠️ Consider ways to reduce expenses or increase income'}
        </div>
    `;
}

        // Generate comprehensive insights
        function generateInsights(income, totalExpenses, savings) {
            const container = document.getElementById('insights-container');
            if (!container) return;
            
            const insights = [];
            
            // 50/30/20 Rule Analysis
            const needsSpent = expenses.filter(e => e.type === 'needs').reduce((sum, e) => sum + e.amount, 0);
            const wantsSpent = expenses.filter(e => e.type === 'wants').reduce((sum, e) => sum + e.amount, 0);
            const savingsSpent = expenses.filter(e => e.type === 'savings').reduce((sum, e) => sum + e.amount, 0);
            
            const needsTarget = income * 0.5;
            const wantsTarget = income * 0.3;
            const savingsTarget = income * 0.2;

            if (needsSpent > needsTarget) {
                insights.push({
                    title: '🏠 Needs Budget Exceeded',
                    content: `You're spending ${(needsSpent - needsTarget).toFixed(2)} more than recommended on needs. Look for ways to reduce housing, utilities, or transportation costs.`
                });
            }

            if (wantsSpent > wantsTarget) {
                insights.push({
                    title: '🎬 Wants Budget Exceeded',
                    content: `You're spending ${(wantsSpent - wantsTarget).toFixed(2)} more than recommended on wants. Consider cutting back on entertainment, dining out, or subscriptions.`
                });
            }

            if (savingsSpent < savingsTarget) {
                insights.push({
                    title: '💰 Savings Below Target',
                    content: `You're saving ${(savingsTarget - savingsSpent).toFixed(2)} less than the recommended 20%. Try automating transfers to a separate savings account.`
                });
            }

            // Cash Flow Analysis
            if (savings < 0) {
                insights.push({
                    title: '⚠️ Negative Cash Flow',
                    content: `You're spending ${Math.abs(savings).toFixed(2)} more than you earn. Immediate action needed: reduce expenses or increase income.`
                });
            } else if (savings > 0 && savings < income * 0.1) {
                insights.push({
                    title: '📊 Low Savings Rate',
                    content: `Your savings rate is only ${((savings/income)*100).toFixed(1)}%. Aim for at least 20% to build wealth over time.`
                });
            }

            // Emergency Fund Analysis
            const monthsCovered = totalExpenses > 0 ? emergencyFund / totalExpenses : 0;
            if (monthsCovered < 3) {
                insights.push({
                    title: '🛡️ Emergency Fund Priority',
                    content: `Your emergency fund covers only ${monthsCovered.toFixed(1)} months of expenses. Build this to 3-6 months before other investments.`
                });
            }

            // Spending Pattern Analysis
            const largestCategory = expenses.reduce((max, expense) => {
                const categoryTotal = expenses.filter(e => e.category === expense.category)
                    .reduce((sum, e) => sum + e.amount, 0);
                return categoryTotal > max.amount ? {category: expense.category, amount: categoryTotal} : max;
            }, {category: '', amount: 0});

            if (largestCategory.amount > 0) {
                insights.push({
                    title: '📈 Largest Expense Category',
                    content: `${getCategoryIcon(largestCategory.category)} ${largestCategory.category} is your largest expense at ${largestCategory.amount.toFixed(2)}/month. Consider if this aligns with your priorities.`
                });
            }

            // Automation Recommendations
            if (savings > 0) {
                insights.push({
                    title: '🤖 Automation Opportunity',
                    content: `You're saving ${savings.toFixed(2)}/month. Set up automatic transfers to make saving effortless and avoid spending this money accidentally.`
                });
            }

            // Render insights
            container.innerHTML = '';
            if (insights.length === 0) {
                container.innerHTML = '<div class="insight-item"><h5>🎉 Excellent Financial Health!</h5><p>Your budget follows sound financial principles. Keep up the great work!</p></div>';
            } else {
                insights.forEach(insight => {
                    const div = document.createElement('div');
                    div.className = 'insight-item';
                    div.innerHTML = `
                        <h5>${insight.title}</h5>
                        <p>${insight.content}</p>
                    `;
                    container.appendChild(div);
                });
            }
        }

        // Initialize sliders
        document.getElementById('income-slider')?.addEventListener('input', updateWhatIf);
        document.getElementById('expense-slider')?.addEventListener('input', updateWhatIf);
    