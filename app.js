var budgetController = (function(){

     var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
     };

     Expense.prototype.calcPercentage = function(totalIncome){

         if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome)*100);
         }
         else{
             this.percentage = -1;
         }
     };

     Expense.prototype.getPercentage = function(){
         return this.percentage;
     }

     var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
     };

     var calculateTotal = function(type) {
         var sum = 0;

         data.allItems[type].forEach(function(cur){
            sum += cur.value;
         });
         data.totals[type] = sum;
     }

     var data = {
         allItems : {
             exp: [],
             inc: [],
         },
         totals: {
             exp: 0,
             inc: 0,
         },
         budget: 0,
         percentage: -1,
     };

     return {
         addItem: function(type,des,val){
            var newItem,ID;

            //ID = lastID + 1
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1; 
            }
            else{
                ID = 0;
            }

            //Create New Item Based On Data Structure
            if(type === 'exp'){
                newItem = new Expense(ID, des, val);
            }
            else if(type === 'inc'){
                newItem = new Income(ID,des,val);
            }

            //Push Into Data Structure
            data.allItems[type].push(newItem);

            //Return New Item
            return newItem;
            
         },

         deleteItem: function(type, ID){
             var ids,index;

           ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(ID);

            if(index !== -1){
                data.allItems[type].splice(index,1);
            }

         },

         calculateBudget: function() {

            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //calculate percentage of income that we spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else{
                data.percentage = -1;
            }
            
         },

         calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });

         },

         getPercentages : function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });

            return allPerc;

         },

         getBudget: function() {
            
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage 
            };

         },

     }

})();


var UIController = (function(){

    var DOMstrings = {
        inputType : '.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month',
    };

    var formatNumber = function (num,type) {
        var numSplit,int,dec,sign;

        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3){
            int = int.substr(0,int.length-3) + ',' + int.substr(int.length-3,3);
        }

        dec = numSplit[1];

        type === 'exp' ? sign = '-' : sign = '+';

        return (sign + ' ' + int + '.' + dec);
    };

    var nodeListForEach = function(list,callback){
        for(var i=0 ; i<list.length ; i++){
            callback(list[i],i);
        }
    };

    return{
       
        getInput: function(){
            return{
                type : document.querySelector(DOMstrings.inputType).value,  //wil be inc or exp
                description : document.querySelector(DOMstrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMstrings.inputValue).value),
            }
        },

        addListItem: function(obj,type){

            var html, newHtml, element;

            //Create HTMl With Place Holder text
            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            }
            else if (type === 'exp'){
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //Replace Place holder Text with actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));

            //Insert into the html code
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);

        },

        deleteListItem: function(selectorID){

            var el = document.getElementById(selectorID);
            //console.log(el);
            el.parentNode.removeChild(el);

        },

        clearFields : function(){
            var fields,fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            var type;
            obj.budget >= 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');

            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }
            else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },

        displayPercentages: function(percentages){
            var fields;

            fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields,function(current,index){

                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }
                else{
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function(){
            var now,year,month;
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            now = new Date();
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = monthNames[month] + ' ' + year;
        },

        changeType: function() {
            
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue 
            );

            nodeListForEach(fields, function(cur,i){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },
        
        getDOMstrings : function(){
            return  DOMstrings;
        },
    }

})();

//GLOBAL APP CONTROLLER
var controller =(function(budgetCtrl,UICtrl){

    var setupEventListeners = function(){
        
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);

        document.addEventListener('keypress',function(event){

            if(event.keyCode === 13 || event.which === 13){
            ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changeType);

    };

    var updateBudget = function(){
        var budget;

        //1. Calculate The Budget
        budgetCtrl.calculateBudget();

        //2. Return The Budget
        budget = budgetCtrl.getBudget();

        //3. Display The Budget On The UI
        UICtrl.displayBudget(budget);

    };

    var updatePercentages = function(){
        var percentages;
        // 1. Calculate The Percentages
        budgetCtrl.calculatePercentages();

        // 2. Read % from budget controller
        percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);

    };
    
    var ctrlAddItem = function(){
        var input,newItem;

        //1. Get The Field Input Data
        input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value>0){

            // 2. Add The Item To The Budget Controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add The Item To The UI
            UICtrl.addListItem(newItem,input.type);

            // 4. Clear The Fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate & Upadte %
            updatePercentages();
        }

    };

    var ctrlDeleteItem = function(event){

        var itemID,type,ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){

            //format = inc-1 
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete item from Data Structure
            budgetCtrl.deleteItem(type,ID);

            // 2. Delete item from UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show New Budget
            updateBudget();

            // 4. Calculate & Upadte %
            updatePercentages();
        }
    };

    return {
        init: function(){
            console.log('Application has Started');
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            UICtrl.displayMonth();
            setupEventListeners();
        },
    };

})(budgetController,UIController);

controller.init();