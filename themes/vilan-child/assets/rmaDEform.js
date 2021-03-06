jQuery( document ).ready(function($) {
	$('select[name="prod1"]').on('change', function() {
		changeproduct( this );
	});
	
	$('#alternative').click(function(){
		if($('#alt_address').is(':visible'))
		{
			$('#alt_address').slideUp();
		}else
		{
			$('#alt_address').slideDown();
		}
	});
	
	var productTags = {
		BCT : "cabman_bct",
		Printer : "cabman_printer",
		GRPSModem : "overig",
		Audioboard : "overig",
		Com_X : "overig",
		MyPos : "mypos_d200",
		Other : "overig"
	};

	var products = {
		BCT : "Cabman BCT",
		Printer : "Cabman printer",
		GRPSModem : "GSM/GPRS Modem",
		Audioboard : "Audioboard",
		Com_X : "Com-X",
		MyPos : "MyPOS",
		Other : "Weitere, nämlich:"
	};

	function sendRMA()
	{
		var errorString = "";	

		var rmas = [];
		var listComplete = true;	
		$('.product-fieldset').each(function(index, row) {
			var rma = {};
			
			rma.product = $(row).find('select option:selected').text();
			rma.product_tag = productTags[$(row).find('select').val()];
			rma.serial = $(row).find('input[id^="serial"]').val();
			rma.complaint = $(row).find('input[id^="complaint"]').val();
			rma.other = $(row).find('input[id^="other"]').val();
			
			if(isNullOrEmpty(rma.product) || isNullOrEmpty(rma.serial)) {
				errorString += 'Reihe ' + (index + 1) + ' ist nicht komplett eingegeben.\n';
				listComplete = false;
				return false;
			}
			
			if(rma.product === products.Other)
			{
				rma.other = $(row).find('input[id^="other"]').val();		
				if(isNullOrEmpty(rma.other))
				{	
					errorString += '"Weitere, nämlich" auf Reihe ' + (index + 1) + ' ist nicht eingegeben.\n';							
					listComplete = false;
					return false;
				}
			}
			rmas.push(rma);
		});
		
		var useAlternativeAddress = $("#alternative:checked").length;
		if(useAlternativeAddress)
		{
			if(isNullOrEmpty($('#off_vest').val()))
			{
				errorString += 'Sitz des Unternehmens ist ein Pflichtfeld.\n';		
			}
			if(isNullOrEmpty($('#off_cont').val()))
			{
				errorString += 'Ansprechpartner ist ein Pflichtfeld.\n';		
			}
			if(isNullOrEmpty($('#off_strn').val()))
			{
				errorString += 'Der Straßenname ist ein Pflichtfeld.\n';
			}
			if(isNullOrEmpty($('#off_huisn').val()))
			{
				errorString += 'Die Hausnummer ist ein Pflichtfeld.\n';
			}
			if(isNullOrEmpty($('#off_postc').val()))
			{
				errorString += 'Die Postleitzahl ist ein Pflichtfeld.\n';
			}
			if(isNullOrEmpty($('#off_stad').val()))
			{
				errorString += 'Stadt ist ein Pflichtfeld.\n';
			}
			if(isNullOrEmpty($('#off_land').val()))
			{
				errorString += 'Land ist ein Pflichtfeld.\n';
			}
		}
		
		if(!$("#termsofagreement:checked").length)
		{
			errorString += 'Sie müssen den Allgemeinen Geschäftsbedingungen zustimmen.\n';		
		}
		
		if(!isNullOrEmpty(errorString))
		{
			alert(errorString);
			return;
		}
		
		
		if(listComplete) {
			$('#loaderContainer').show();
			$('#loader').show();
			var organization = document.userData.organization;
			var user = document.userData.user;

			//i stopped here to clarify the two variables above and the php file sendRMA.php
			var params = {
					companyName : (useAlternativeAddress ? $('#off_vest').val() : organization.name),				
					companyPerson : (useAlternativeAddress ? $('#off_cont').val() : user.name),
					companyPhone : organization.organization_fields.telefoonnummer,
					companyStreet_number : (useAlternativeAddress ? ($('#off_strn').val() + ' ' + $('#off_huisn').val()) : organization.organization_fields.straat_huisnummer),				
					companyPostalCode : (useAlternativeAddress ? $('#off_postc').val() : organization.organization_fields.postcode),
					companyTown : (useAlternativeAddress ? $('#off_stad').val() : organization.organization_fields.plaats),
					companyCountry : (useAlternativeAddress ? $('#off_land').val() : organization.organization_fields.land),
					companyEmail : user.email,
					rmas: rmas,
					username : document.username,
					password : document.password
				};
				
			var data = { action: "send_rmaDE", parameters: params };
			
			$.ajax({
				url:ajaxurl, //"/wp-admin/admin-ajax.php",
				type:'POST',
				data: data,
				success:function(req)
				{
					var res = $.parseJSON(req);
					$('#loaderContainer').hide();
					$('#loader').hide();	
					
					if(endsWith(res.responseText, 'pdf'))
					{			
						$('#formContainer').hide();
						notify("alert-success", "alert-danger", "Success!", "Ihr Rücksendeformular wurde erfolgreich verschickt");
						$('.rmaImage').attr("style", "display: none;");
						//window.open(res.responseText, '_blank'); To avoid the pop-up on Microsoft Edge.
					}
					else
					{
						notify("alert-danger", "alert-success", "Error!", "Es ist ein Fehler aufgetreten, bei Ihren Rücksendeformular");
					}
				},
				error: function (req) {
					$('#loaderContainer').hide();
					$('#loader').hide();
					notify("alert-danger", "alert-success", "Error!", "Es ist ein Fehler aufgetreten, bei Ihren Rücksendeformular");
				}
			});
		}
		
		return false;
	}
	function notify (newClass, oldClass, mainText, detailText) {
		if( $("#successText .alert").length > 0 ) {
			$('#successText').fadeOut("fast", function(){			
				$('#successText').show();
				if(oldClass.length > 0) {
					$("#successText .alert").removeClass(oldClass);
				}	
				if(newClass.length > 0) {
					$("#successText .alert").addClass(newClass);
				}
				if(mainText.length > 0) {
					$("#successText .alert strong").html(mainText);
				}
				if(detailText.length > 0) {
					$("#successText .alert .desc").html(detailText);
				}
			});
		}
		else {
			var $html = '<div class="alert '+newClass+' alert-dismissible" role="alert">'+
                    '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+
                    '<strong>'+mainText+'</strong> <span class="desc">'+detailText+'</span>'+
                '</div>';
            $("#notify").html($html).show();
		}
	}

	function endsWith(str, suffix) {
	    return str.indexOf(suffix, str.length - suffix.length) !== -1;
	}

	function isNullOrEmpty (string)
	{
		return (!string || string.length === 0);
	}

	function changeproduct(select)
	{
		var selectId = select.id.match(/\d+$/)[0],
		selected = $(select).find(':selected');
		
		if(selected.text() === products.BCT)
		{
			$('#other' + selectId).hide();
		}
		else if(selected.text() === products.Other)
		{
			$('#other' + selectId).show();
		}
		else
		{	
			$('#other' + selectId).hide();
		}
	}
	
	function addRow ()
	{	
		var rows = $('#rmaContainer .product-fieldset');	
		var numrows = rows.length + 1;
		
		var elementString = 
			'<div class="product-fieldset top-separator" id="append-fieldset'+numrows+'">'+
				'<button type="button" class="close" data-dismiss="append-fieldset'+numrows+'" aria-label="Close"><span aria-hidden="true" onclick="javascript: removeRow('+numrows+');">&times;</span></button>'+
				'<div class="form-group col-md-6">'+
					'<label class="sr-only" for="prod_selector'+numrows+'" id="lprod'+numrows+'">Produkt</label>'+
					'<select class="form-control" id="prod_selector'+numrows+'" name="prod'+numrows+'" onchange="javascript: changeproduct(this);">'+
		                    '<option value="" selected="selected" style="display:none">Produktauswahl</option>';

		for(product in products)
		{
			if(products[product] == products.overig)
			{
				elementString += '<option value="'+ product + '">Weitere, nämlich:</option>';
			}
			else
			{
				elementString += '<option value="'+ product + '">'+ products[product] + '</option>';
			}
		}
		elementString += '</select>'+
		            '</div>'+
		            '<div class="form-group col-md-6" id="other'+numrows+'" style="display: none;">'+
		                '<label class="sr-only" for="other'+numrows+'" id="lother'+numrows+'">Other</label>'+
		                '<input placeholder="Produkt" type="text" name="other'+numrows+'" id="other'+numrows+'" class="required form-control" />'+
		            '</div>'+
		            '<div class="form-group col-md-6" id="serial'+numrows+'">'+    
		                '<label class="sr-only" for="serial'+numrows+'" id="lserial'+numrows+'">Seriennummer</label>'+
		                '<input placeholder="Seriennummer" type="text" name="serial'+numrows+'" id="serial'+numrows+'" class="required form-control" />'+
		            '</div>'+
		            '<div class="form-group col-md-6">'+    
		                '<label class="sr-only" for="complaint'+numrows+'" id="lcomplaint'+numrows+'">Beschreibung der Problems</label>'+
		                '<input placeholder="Beschreibung der Problems" type="text" name="complaint'+numrows+'" id="complaint'+numrows+'" class="required form-control" />'+
		            '</div>'+
		        '</div>'+
		    '</div>';
		    
	    $("#rmaContainer").append( elementString );
	}

	function login_zendesk()
	{
		$('#notify').hide();
		$('#loaderContainer').show();
		$('#loader').show();
		var $params = {
					action : 'login_zendesk',
					parameters : { 
						username : $('#zd_username').val(),			
						password : $('#zd_password').val()
					}		
		};

		var xhr = $.ajax({
			url:ajaxurl, //"/wp-admin/admin-ajax.php",
			type:'POST',
			data: $params,
			success: function(req)
			{
				var res = $.parseJSON(req);
				$('#loaderContainer').hide();
				$('#loader').hide();	
				
				if(res.success == '1')
				{
					document.username = $params.parameters.username;
					document.password = $params.parameters.password;
					
					document.userData = res.result;
					$('#loginContainer').toggle();
					$('#formContainer').toggle();

					var organization = document.userData.organization;
					var user = document.userData.user;
					
					$('#loggedUsername').html(user.name);
					$('#loggedCompany').html(organization.name);
					$('#loggedName').html(user.name);
					$('#loggedAddress').html(organization.organization_fields.straat_huisnummer);
					$('#loggedZip').html(organization.organization_fields.postcode);
					$('#loggedTown').html(" " + (endsWith(organization.organization_fields.plaats, 'null') ? '' : organization.organization_fields.plaats));
					$('#loggedCountry').html(organization.organization_fields.land);
					$('#loggedCountry').css('textTransform', 'capitalize');
				}
				else
				{
					notify("alert-danger", "alert-success", "Error!", "Benutzername oder Passwort ist falsch.");
				}
			},
			error: function (req) {
				$('#loaderContainer').hide();
				$('#loader').hide();
				notify("alert-danger", "alert-success", "Error!", "Es ist ein Fehler aufgetreten, bei Ihrer Anfrage für Einbauanfrage");
				console.log(req);
			}
		});
	}
	
	//implement
	$('#cabman_login').click( login_zendesk );
	$('#cabman_send_rma').click( sendRMA );
	$('#cabman_add_row').click( addRow );	
});

function removeRow(id)
{
	jQuery('#append-fieldset'+id).remove();
}

function changeproduct(select)
{
	var products = {
		BCT : "Cabman BCT",
		Printer : "Cabman printer",
		GRPSModem : "GSM/GPRS Modem",
		Audioboard : "Audioboard",
		Com_X : "Com-X",
		MyPos : "MyPos",
		Other : "Weitere, nämlich:"
	};
	
		var selectId = select.id.match(/\d+$/)[0],
		selected = jQuery(select).find(':selected');
		
		if(selected.text() === products.BCT)
		{
			jQuery('#other' + selectId).hide();
		}
		else if(selected.text() === products.Other)
		{
			jQuery('#other' + selectId).show();
		}
		else
		{	
			jQuery('#other' + selectId).hide();
		}
	}
