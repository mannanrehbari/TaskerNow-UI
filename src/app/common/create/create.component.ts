import { Component, OnInit } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AmazingTimePickerService } from 'amazing-time-picker';
import { RequestStatus } from 'src/app/enums/request-status.enum';
import { Location } from 'src/app/models/location';
import { ServiceType } from 'src/app/models/service-type';
import { Servicerequest } from 'src/app/models/servicerequest';
import { FirstsearchService } from 'src/app/services/app/firstsearch.service';
import { SnackbarService } from 'src/app/services/app/snackbar.service';
import { TrackingService } from 'src/app/services/app/tracking.service';
import { DevicesizeService } from 'src/app/services/devicesize.service';
import { PhoneverifyComponent } from './phoneverify/phoneverify.component';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {

  isHandset: boolean;
  locations: Location[]
  serviceTypes: ServiceType[]

  selectedLocation: Location;
  selectedService: ServiceType;
  
  serviceRequest: Servicerequest;

  // pieces of request
  firstName: string;
  lastName: string = null;
  seekerPhone: string;
  address: string;
  details: string;
  serviceTypeId: number;
  locationId: number;
  requestStatus: RequestStatus
  requestDate: Date;
  requestTime: String;

  minDate: Date;
  maxDate: Date;

  isEditable: boolean = true;
  allFieldsValid: boolean;




  constructor(
    private dsService: DevicesizeService,
    private firstSearchService: FirstsearchService,
    private timePicker: AmazingTimePickerService,
    private trackingService: TrackingService,
    private router: Router,
    public phoneVerDlg: MatDialog,
    private _snackBarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.serviceRequest = new Servicerequest();
    this.dsService.isHandset$.subscribe(
      (data) => { this.isHandset = data }
    );
    this.allFieldsValid = true;
    this.firstSearchService.data.subscribe(
      (data) => {
        if(!data.location || !data.serviceType) {
          this.router.navigate(['/']);
        }
        this.selectedLocation = data.location;
        this.selectedService = data.serviceType;
      }
    );
  }

  openTimePicker() {
    const requestTimePicker = this.timePicker.open();
    requestTimePicker.afterClose().subscribe(
      requestedTime => {
        this.requestTime = requestedTime;
      }
    );
  }

  dateChange(event: MatDatepickerInputEvent<Date>) {
    this.requestDate = event.value;
  }


  validations() {
    if (this.firstName && this.lastName &&
      this.address && this.details &&
      this.requestDate && this.selectedLocation &&
      this.requestTime &&
      this.selectedService
    ) {
      this.allFieldsValid = true;
      this.populateRequestObject();
      this.openDialog();
    } else{
      this.allFieldsValid = false;
      this._snackBarService.snackBar('Invalid information');
    }
  }

  openDialog(){
    const dlgRef = this.phoneVerDlg.open(PhoneverifyComponent, {
      disableClose: true,
      data: this.serviceRequest
    });

    dlgRef.afterClosed().subscribe(
      (trackingId) => {
        this.router.navigate(['/track', trackingId]);
      }, (error) => {
        this._snackBarService.snackBar(error);
      }
    );
  }


  populateRequestObject() {
    this.serviceRequest.firstName = this.firstName;
    this.serviceRequest.lastName = this.lastName;
    this.serviceRequest.address = this.address;
    this.serviceRequest.details = this.details;
    this.serviceRequest.locationId = this.selectedLocation.id;
    this.serviceRequest.serviceTypeId = this.selectedService.id;
    this.serviceRequest.requestDate = this.requestDate;
    
  }



}
