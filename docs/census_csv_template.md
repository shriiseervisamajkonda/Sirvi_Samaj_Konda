# 📊 Shri Seervi Samaj Konda — Census CSV Import Template & Specification

> **Purpose**: Standard Excel/CSV format for bulk uploading village family census records from Gram Panchayat physical forms into Supabase.

---

## 1. CSV Columns Specification

When collecting or compiling offline census records in Microsoft Excel or Google Sheets, use the following column headers:

| Header Name | Required | Example | Description & Notes |
| :--- | :---: | :--- | :--- |
| `panchayat_family_id` | **Yes** | `1` | परिवार क्रमांक (From Census sheet header) |
| `gotra` | **Yes** | `chouhan` | कुलनाम / गौत्र (`chouhan`, `bhayal`, `kag`, `pawar`, `solanki`, `choyal`, `padiyar`, `gehlot`, `agalcha`, `lacheta`, `rathore`, `shinada`, `barfa`, `hammad`, `sencha`) |
| `land_area` | No | `03 एकड़` | कृषि भूमि रकबा (Acres) |
| `faliya_or_ward` | No | `माताजी फलिया` | फलिया / वार्ड / मोहल्ला |
| `member_number` | **Yes** | `1` | परिवार सदस्य क्रम संख्या (1, 2, 3, 4...) |
| `first_name` | **Yes** | `Shantilal` | सदस्य का नाम (English) |
| `last_name` | No | `Chouhan` | कुलनाम (English) |
| `name_hi` | No | `शांतिलाल चौहान` | सदस्य का नाम (हिंदी) |
| `relation_to_head`| **Yes** | `self` | मुखिया से संबंध (`self`, `spouse`, `son`, `daughter`, `daughter_in_law`, `father`, `mother`, `brother`, `sister`, `grandson`, `granddaughter`, `other`) |
| `relative_relation_type`| **Yes** | `father` | संबंध प्रकार (`father` या `husband`) |
| `relative_name` | **Yes** | `Mohan` | पिता या पति का नाम (`Mohan`, `Shantilal`) |
| `is_head` | **Yes** | `TRUE` | क्या यह मुखिया है? (`TRUE` for Mukhiya, `FALSE` for others) |
| `dob` | No | `1981-01-01` | जन्म दिनांक (`YYYY-MM-DD` या `DD-MM-YYYY`) |
| `approximate_age` | No | `45` | अनुमानित आयु (यदि DOB उपलब्ध न हो) |
| `gender` | **Yes** | `male` | लिंग (`male`, `female`) |
| `education` | No | `6th` | शैक्षणिक योग्यता (`6th`, `8th`, `10th`, `12th`, `Graduate`, `PostGraduate`, `B.Tech`, etc.) |
| `occupation` | No | `tailoring` | व्यवसाय (`tailoring`, `shopkeeper`, `agriculture`, `student`, `homemaker`, `service`, `business`, `other`) |
| `mobile_number` | No | `7724878027` | 10-अंकीय मोबाइल नंबर |
| `blood_group` | No | `O+` | ब्लड ग्रुप (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`, `unknown`) |
| `marital_status` | No | `married` | वैवाहिक स्थिति (`married`, `single`, `widowed`, `divorced`) |

---

## 2. Sample CSV Content (`data/census_import_template.csv`)

```csv
panchayat_family_id,gotra,land_area,faliya_or_ward,member_number,first_name,last_name,name_hi,relation_to_head,relative_relation_type,relative_name,is_head,dob,approximate_age,gender,education,occupation,mobile_number,blood_group,marital_status
1,chouhan,03 एकड़,माताजी फलिया,1,Shantilal,Chouhan,शांतिलाल चौहान,self,father,Mohan,TRUE,1981-01-01,45,male,6th,tailoring,7724878027,O+,married
1,chouhan,03 एकड़,माताजी फलिया,2,Urmila,Chouhan,उर्मिला चौहान,spouse,husband,Shantilal,FALSE,1978-01-01,48,female,2nd,homemaker,,unknown,married
1,chouhan,03 एकड़,माताजी फलिया,3,Anil,Chouhan,अनिल चौहान,son,father,Shantilal,FALSE,1997-01-01,29,male,8th,shopkeeper,9981644564,B+,single
1,chouhan,03 एकड़,माताजी फलिया,4,Sunil,Chouhan,सुनिल चौहान,son,father,Shantilal,FALSE,2003-01-01,23,male,9th,agriculture,7909784358,O+,single
2,bhayal,05 एकड़,बडेर मार्ग,1,Kailash,Bhayal,कैलाश भायल,self,father,Ratna,TRUE,1975-05-12,51,male,10th,agriculture,9826012345,A+,married
2,bhayal,05 एकड़,बडेर मार्ग,2,Kamla,Bhayal,कमला भायल,spouse,husband,Kailash,FALSE,1979-08-20,47,female,5th,homemaker,,unknown,married
```
