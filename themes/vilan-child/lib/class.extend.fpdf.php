<?php require_once('fpdf/fpdf.php');
class RMA_PDF extends FPDF
{
	private $BCT_present = false;

	// Page footer
	function Footer()
	{
		$this->SetFont('Arial','I',8);
		if($this->BCT_present)
		{
			$this->SetY(-25);
			$this->MultiCell(176,5,'*Een Cabman BCT dient na uitbouw altijd afgemeld te worden bij het RDW. Indien de BCT niet correct is afgemeld zijn wij genoodzaakt om de Cabman BCT volledig in rekening te brengen. Kosten hiervoor bedragen '.EURO.'899,-' ,'T');
		}
		// Position at 1.5 cm from bottom
		$this->SetY(-15);			
		// Page number
		$this->Cell(0,10,'Pagina '.$this->PageNo().'/{nb}',0,0,'C');
	}
	
	function AddTicket($rma, $ticketId)
	{	
		$this->SetFont('Arial','B',11);	
		$this->SetFillColor(0,0,0);
		$this->SetTextColor(255,255,255);
		$this->Cell(176,6,'Ticket #' . $ticketId, 1, 0, 'L', 1);
		$this->Ln();
		$this->SetFillColor(255,255,255);
		$this->SetTextColor(0,0,0);
		if($rma->product === "Cabman BCT")
		{
			$this->Cell(40,6,'Product:','LRB');
			$this->SetFont('Arial','',11);
			$this->Cell(36,6,$rma->product,'LRB');
			$this->SetFont('Arial','B',11);
			$this->Cell(50,6,'Serienummer:','LRB');
			$this->SetFont('Arial','',11);
			$this->Cell(50,6,$rma->serial,'LRB');
			$this->Ln();
			$this->SetFont('Arial','B',11);
			$this->Cell(40,6,'RDW afgemeld*:','LRB');
			$this->SetFont('Arial','',11);
			$this->Cell(36,6,'V','LRB');
			$this->SetFont('Arial','B',11);
			$this->Cell(50,6,'Afgemeld op Kenteken:','LRB');
			$this->SetFont('Arial','',11);
			$this->Cell(50,6,$rma->licensePlate,'LRB');
			$this->Ln();
			$oldY = $this->GetY();
			$this->SetX(57);
			$this->SetFont('Arial','',11);
			$this->MultiCell(136,6,$rma->description,'LRB');
      $this->SetX(17);
      $height = $this->GetY() - $oldY;
      $this->SetY($oldY);
      $this->SetFont('Arial','B',11);
			$this->Cell(40,$height,'Klachtomschrijving:','LRB');
		}
		else if($rma->product === "Overig")
		{
			$this->Cell(40,6,'Product:','LRB');
			$this->SetFont('Arial','',11);
			$this->Cell(46,6,'Overig: '. $rma->other,'LRB');
			$this->SetFont('Arial','B',11);
			$this->Cell(40,6,'Serienummer:','LRB');
			$this->SetFont('Arial','',11);
			$this->Cell(50,6,$rma->serial,'LRB');	
			$this->Ln();
			$oldY = $this->GetY();
			$this->SetX(57);
			$this->SetFont('Arial','',11);
			$this->MultiCell(136,6,$rma->description,'LRB');
      $this->SetX(17);
      $height = $this->GetY() - $oldY;
      $this->SetY($oldY);
      $this->SetFont('Arial','B',11);
			$this->Cell(40,$height,'Klachtomschrijving:','LRB');
		}
		else
		{
			$this->Cell(40,6,'Product:','LRB');
			$this->SetFont('Arial','',11);
			$this->Cell(40,6,$rma->product,'LRB');
			$this->SetFont('Arial','B',11);
			$this->Cell(40,6,'Serienummer:','LRB');
			$this->SetFont('Arial','',11);
			$this->Cell(56,6,$rma->serial,'LRB');	
			$this->Ln();
			$oldY = $this->GetY();
			$this->SetX(57);
			$this->SetFont('Arial','',11);
			$this->MultiCell(136,6,$rma->description,'LRB');
      $this->SetX(17);
      $height = $this->GetY() - $oldY;
      $this->SetY($oldY);
      $this->SetFont('Arial','B',11);
			$this->Cell(40,$height,'Klachtomschrijving:','LRB');	
		}
	}

	function AddContactInfo($totalWidth, $info)
	{	
		$this->SetFont('Arial','B',11);			
		$this->SetTextColor(0,0,0);
		$this->Cell($totalWidth / 2,6,'Bedrijfsnaam:');
		$this->SetFont('Arial','',11);
		$this->Cell($totalWidth / 2,6,$info['companyName']);
		$this->Ln();
		$this->SetFont('Arial','B',11);
		$this->Cell($totalWidth / 2,6,'Adres:');
		$this->SetFont('Arial','',11);
		$this->Cell($totalWidth / 2,6,$info['companyStreet_number']);
		$this->Ln();
		$this->SetFont('Arial','B',11);
		$this->Cell($totalWidth / 2,6,'Postcode / Plaats:');
		$this->SetFont('Arial','',11);
		$this->Cell($totalWidth / 2,6,$info['companyPostalCode']. ' ' .$info['companyTown']);				
		$this->Ln();
		$this->SetFont('Arial','B',11);
		$this->Cell($totalWidth / 2,6,'Contactpersoon:');
		$this->SetFont('Arial','',11);
		$this->Cell($totalWidth / 2,6,$info['companyPerson']);
		$this->Ln();
		$this->SetFont('Arial','B',11);
		$this->Cell($totalWidth / 2,6,'Telefoonnummer:');
		$this->SetFont('Arial','',11);
		$this->Cell($totalWidth / 2,6,$info['companyPhone']);
		$this->Ln();
		$this->SetFont('Arial','B',11);
		$this->Cell($totalWidth / 2,6,'Email:');
		$this->SetFont('Arial','',11);
		$this->Cell($totalWidth / 2,6,$info['companyEmail']);	
	}

	function AddTotals($totalWidth, $rmas)
	{
		$this->SetFont('Arial','B',11);
		$this->SetFillColor(0,0,0);
		$this->SetTextColor(255,255,255);
		$this->Cell($totalWidth / 12,6,'Aantal', 1, 0, 'L', 1);
		$this->Cell(($totalWidth / 12) * 3,6,'Product',  1, 0, 'L', 1);
		$this->Cell($totalWidth / 12,6,'Aantal', 1, 0, 'L', 1);
		$this->Cell(($totalWidth / 12) * 3,6,'Product',  1, 0, 'L', 1);
		$this->Cell($totalWidth / 12,6,'Aantal', 1, 0, 'L', 1);
		$this->Cell(($totalWidth / 12) * 3,6,'Product',  1, 0, 'L', 1);
		$this->Ln();
		$this->SetTextColor(0,0,0);
		$this->SetFont('Arial','',11);
		
		$totals = array();
		foreach($rmas as $rma)
		{		
			isset($totals[$rma->product]) ? $totals[$rma->product]++ : $totals[$rma->product] = 1;
		}
		if(array_key_exists('Cabman BCT', $totals))
		{
			$this->BCT_present = true;
		}
		
		
		$last = key( array_slice( $totals, -1, 1, TRUE ) );		
		$index = 1;
		foreach($totals as $key => $total) 
		{
			$this->Cell($totalWidth / 12,6,$total,'LRB');
			$this->Cell(($totalWidth / 12) * 3,6,$key,'LRB');
			if($index % 3 == 0)
			{
				$this->Ln();
			}
			if($key == $last && $index % 2 == 0)
			{
				$this->Cell($totalWidth / 12,6,'','LRB');
				$this->Cell(($totalWidth / 12) * 3,6,'','LRB');
			}
			else if($key == $last && $index % 1 == 0)
			{
				$this->Cell($totalWidth / 12,6,'','LRB');
				$this->Cell(($totalWidth / 12) * 3,6,'','LRB');
				$this->Cell($totalWidth / 12,6,'','LRB');
				$this->Cell(($totalWidth / 12) * 3,6,'','LRB');
			}			
			$index++;
		}
	}
}
