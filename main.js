//
// Place any custom JS here
//

let viewInfo = {};
let queryConditions = {
        select: [],
        from: '',
        where: {}
};
let globalCurrentColumn = '';

fetch('views.json')
    .then(response => response.json())
    .then(data => {
        viewInfo = data;  
        console.log('Loaded viewInfo:', viewInfo);

        selectViewLoadDropdown();
    })
    .catch(error => {
        console.error('Error loading views.json:', error);
    });

    

function selectViewLoadDropdown() {
    $('#selectViewDropdownMenu').empty();
    Object.keys(viewInfo).forEach(table => {
        $('#selectViewDropdownMenu').append(
            `<li><a class="dropdown-item" href="#" data-value="${table}">${table}</a></li>`
        );
    });
}

$(document).on('click', '#selectViewDropdownMenu .dropdown-item', function () {
  const viewName = $(this).data('value');
  queryConditions.from = viewName;
    $('#selectViewDropdownBtn').text(viewName);
    $('#generateQueryBtn').prop('disabled', false);

  loadViewColumns(viewName);
})

function loadViewColumns(viewName) {
    const columns = viewInfo[viewName];
    const checkboxArea = $('#selectColumnsCheckboxArea');
    checkboxArea.empty();

    columns.forEach(column => {
        const checkboxHtml = `
            <div class="col-3 d-flex align-items-center">
               <input class= "form-check-input me-2 columns-checkbox" type="checkbox" id="chk_${column}" value = "${column}">
               <label class = "form-check-label me-2 columns-label" for="chk_${column}">${column}</label>
                <button type="button" class="btn btn-sm btn-outline-danger btn-add-condition" data-columns="${column}" style="padding:0.15rem 0.25rem; font-size:0.65rem;">+</button>
            </div>
        `;
        checkboxArea.append(checkboxHtml);
    });

}

$(document).on('change', '.columns-checkbox', function (){
    const column = $(this).val();
    if (this.checked) {
        queryConditions.select.push(column);
    } else {
        queryConditions.select = queryConditions.select.filter(col => col !== column);
    }
    console.log('Current selected columns:', queryConditions.select);
})

$(document).on('click', '#generateQueryBtn', function () {
    generateQueryText()
  
})

function generateQueryText() {
    const select = queryConditions.select;
    const from = queryConditions.from;
    const where = queryConditions.where;

    console.table(where)

    const select_final = select.length ? select.join(', ') : '*';

    let where_clauses = [];

    Object.entries(where).forEach(([column, conditions]) => {
        conditions.forEach(condition => {
            where_clauses.push(`${column} ${condition.operator} '${condition.value}'`);
        });
    });

    const where_final =  'WHERE ' + where_clauses.join(' AND ');
    console.log(where_final);

    let queryText = `<span class="text-primary">SELECT</span> ${select_final}
<span class="text-success">FROM</span> ${from};
<span>${where_final}</span>`

    $('#queryOutputText').html(queryText)
}

$(document).on('click', '.btn-add-condition', function () {
    globalCurrentColumn = $(this).data('columns');
    $('#conditionColumnLabel').text(`Conditions for: ${globalCurrentColumn}`);

    $('#conditionRows').empty();

    const existingConditions = queryConditions.where[globalCurrentColumn] || [];
    
    if (existingConditions.length === 0) {
        addConditionRows();
    } else {
        existingConditions.forEach(condition => {
            addConditionRows(condition.operator, condition.value);
        })
    }

    const modal = new bootstrap.Modal($('#conditionModal'));
    modal.show();
});

$(document).on('click', '#addConditionRowBtn', function () {
    addConditionRows();
})

function addConditionRows(selectedOperator = '=', selectedValue = '') {
    console.log('Adding new condition row');
    const row = `<div class="d-flex gap-2 condition-row mb-2">
      <select class="form-select form-select-sm condition-operator" style="width: 140px;">
        <option value="=" ${selectedOperator === '=' ? 'selected' : ''}>=</option>
        <option value="!=" ${selectedOperator === '!=' ? 'selected' : ''}>!=</option>
        <option value=">" ${selectedOperator === '>' ? 'selected' : ''}>&gt;</option>
        <option value="<" ${selectedOperator === '<' ? 'selected' : ''}>&lt;</option>
        <option value="OR" ${selectedOperator === 'OR' ? 'selected' : ''}>OR</option>
        <option value="ILIKE" ${selectedOperator === 'ILIKE' ? 'selected' : ''}>ILIKE</option>
        <option value="BETWEEN" ${selectedOperator === 'BETWEEN' ? 'selected' : ''}>BETWEEN</option>
      </select>

      <input type="text" class="form-control form-control-sm condition-value" placeholder = "Enter value" value ="${selectedValue}">
      <button type="button" class="btn btn-sm btn-outline-danger btn-remove-condition" style="padding:0.1rem 0.35rem; font-size:0.65rem;">x</button>

    </div>
    `;

    $('#conditionRows').append(row);
    $('#conditionRows .condition-row:last-child .condition-value').focus();
}

$(document).on('click', '.btn-remove-condition', function () {
    $(this).closest('.condition-row').remove();
})

$(document).on('click', '#saveConditionBtn', function (){
    let conditions = [];
    $('#conditionRows .condition-row').each(function (){
        const operator = $(this).find('.condition-operator').val();
        const value = $(this).find('.condition-value').val().trim();
        if (value) {
            conditions.push({ operator, value });
        }
    })

    if (conditions.length > 0) {
        queryConditions.where[globalCurrentColumn] = conditions;
        $(`.btn-add-condition[data-columns="${globalCurrentColumn}"]`).addClass('btn-danger').removeClass('btn-outline-danger');
    } else {
        delete queryConditions.where[globalCurrentColumn];
        $(`.btn-add-condition[data-columns="${globalCurrentColumn}"]`).addClass('btn-outline-danger').removeClass('btn-danger');
    }
    console.log(queryConditions);
     $('#conditionModal').modal('hide');
})

function showMsgPopup(message, duration = 1500) {
  // Set the message text
  $('#messageModalMessage').text(message);

  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('messageModal'));
  modal.show();

  // Auto hide after X milliseconds
  setTimeout(() => modal.hide(), duration);
}
;
