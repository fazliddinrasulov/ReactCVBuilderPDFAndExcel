import {useEffect, useState} from "react";
import axios from "axios";

function App() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        age: 0,
        email: '',
        phone: '',
        educations: [
            {
                educationId: 0,
                educationSchool: '',
                educationStartDate: '',
                educationEndDate: ''
            },
        ],
        experiences: [
            {
                experienceId: 0,
                experienceTitle: '',
                experienceCompany: '',
                experienceDescription: '',
                experienceStartDate: '',
                experienceEndDate: ''
            },
        ],
        photo: null,
        selectedTech: []
    });

    const [selectedImage, setSelectedImage] = useState(null); // state to store the selected image

    const [technologies, setTechnologies] = useState([]);

    const handleSelectChange = (event) => {
        if (!formData.selectedTech.includes(event.target.value)) {
            setFormData({...formData, selectedTech: [...formData.selectedTech, event.target.value]});
        }
    };

    const handleChange = (e) => {
        const {id, value} = e.target;
        if (id.includes('education')) {
            const [field, index] = id.split('-'); // e.g., 'educationSchool-0' -> ['educationSchool', '0']
            const newEducations = formData.educations.map((education) => {
                if (education.educationId === parseInt(index)) {
                    return {...education, [field]: value};
                }
                return education;
            });
            setFormData({
                ...formData,
                educations: newEducations
            });
        } else if (id.includes('experience')) {
            const [field, index] = id.split('-'); // e.g., 'experienceCompany-0' -> ['educationSchool', '0']
            const newExperience = formData.experiences.map((experience) => {
                if (experience.experienceId === parseInt(index)) {
                    return {...experience, [field]: value};
                }
                return experience;
            });
            setFormData({
                ...formData,
                experiences: newExperience
            });
        } else {
            setFormData({
                ...formData,
                [id]: value
            });
        }
    };

    const handleFileChange = (e) => {
        setFormData({
            ...formData,
            photo: e.target.files[0]
        });
        setSelectedImage(URL.createObjectURL(e.target.files[0]));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('photo', formData.photo);
        data.append('firstName', formData.firstName);
        data.append('lastName', formData.lastName);
        data.append('age', formData.age);
        data.append('email', formData.email);
        data.append('phone', formData.phone);
        data.append('educations', JSON.stringify(formData.educations));
        data.append('experiences', JSON.stringify(formData.experiences));
        data.append('selectedTech', JSON.stringify(formData.selectedTech));
        try {
            const response = await axios.post('http://localhost:8080/api/file/generate', data, {
                responseType: 'blob',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'cv.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error generating CV', error);
        }
    };

    useEffect(() => {
        axios.get("http://localhost:8080/api/file/techs")
            .then(resp => setTechnologies(resp.data))
            .catch(e => {
                console.log(e)
            })
    }, []);

    return (
        <div className="container mt-5">
            <div className="card">
                <div className="card-body">
                    <h1 className="text-center">CV Builder</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="d-flex">
                            <div className="mr-5">
                                {selectedImage !== null ?
                                    <img width="200" height="200" src={selectedImage + ''} alt="Selected"/> :
                                    <img width="200" height="200"
                                         src="https://static.vecteezy.com/system/resources/previews/026/619/142/non_2x/default-avatar-profile-icon-of-social-media-user-photo-image-vector.jpg"
                                         alt=""
                                    />
                                }
                            </div>
                            <div className="ml-5">
                                <div className="form-row">
                                    <div className="form-group">
                                        <input type="file" id="photo"
                                               onChange={handleFileChange}/>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group col-md-5">
                                        <label htmlFor="firstName">First Name</label>
                                        <input type="text" className="form-control" id="firstName"
                                               value={formData.firstName}
                                               onChange={handleChange} placeholder="First Name"/>
                                    </div>
                                    <div className="form-group col-md-5">
                                        <label htmlFor="lastName">Last Name</label>
                                        <input type="text" className="form-control" id="lastName"
                                               value={formData.lastName}
                                               onChange={handleChange} placeholder="Last Name"/>
                                    </div>
                                    <div className="form-group col-md-2">
                                        <label htmlFor="age">Age</label>
                                        <input type="number" className="form-control" id="age" value={formData.age}
                                               onChange={handleChange}/>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group col-md-6">
                                        <label htmlFor="email">Email</label>
                                        <input type="email" className="form-control" id="email" value={formData.email}
                                               onChange={handleChange} placeholder="Email"/>
                                    </div>
                                    <div className="form-group  col-md-6">
                                        <label htmlFor="phone">Phone</label>
                                        <input type="text" className="form-control" id="phone" value={formData.phone}
                                               onChange={handleChange} placeholder="Phone"/>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="col-md-3">
                                <div className="form-group">
                                    <select
                                        className="form-control"
                                        id="technologySelect"
                                        onChange={handleSelectChange}
                                    >
                                        <option selected disabled>Select Technologies</option>
                                        {technologies.map((tech) => (
                                            <option key={tech} value={tech}>
                                                {tech}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-9 d-flex flex-wrap">
                                {formData.selectedTech.map((tech, i) => (
                                    <p key={i} className="mx-2 bg-light d-flex align-items-center p-2" onClick={() => {
                                        let filter = formData.selectedTech.filter(item => item !== tech);
                                        setFormData({...formData, selectedTech: filter});
                                    }}>{tech}</p>
                                ))}

                            </div>
                        </div>

                        <div className="d-flex">
                            <h3>Education</h3>
                            <button type="button" className="btn btn-info mx-4" onClick={() => {
                                setFormData({
                                    ...formData, educations: [
                                        ...formData.educations,
                                        {
                                            educationId: formData.educations[formData.educations.length - 1].educationId + 1,
                                            educationSchool: '',
                                            educationStartDate: '',
                                            educationEndDate: ''
                                        }
                                    ]
                                })
                            }}>add
                            </button>
                        </div>
                        {formData.educations.map((education) => {
                            return (
                                <div key={education.educationId}>
                                    <div className=" position-relative d-flex">
                                        <div className="horizontal-break"></div>
                                        <button className="btn btn-outline-danger" onClick={() => {
                                            let filter = formData.educations.filter(item=>item.educationId !== education.educationId);
                                            setFormData({...formData, educations: filter})
                                        }}>❌
                                        </button>
                                    </div>

                                    <div className="form-row">
                                        <input type="hidden" id={`educationId-${education.educationId}`}
                                               value={education.educationId}/>
                                        <div className="form-group col-md-4">
                                            <label
                                                htmlFor={`educationSchool-${education.educationId}`}>School/University</label>
                                            <input type="text" className="form-control"
                                                   id={`educationSchool-${education.educationId}`}
                                                   value={education.educationSchool}
                                                   onChange={handleChange} placeholder="School/University"/>
                                        </div>
                                        <div className="form-group col-md-4">
                                            <label htmlFor={`educationStartDate-${education.educationId}`}>Start Date of
                                                Education</label>
                                            <input type="date" className="form-control"
                                                   id={`educationStartDate-${education.educationId}`}
                                                   value={education.educationStartDate} onChange={handleChange}
                                                   placeholder="Start Date of Education"/>
                                        </div>
                                        <div className="form-group col-md-4">
                                            <label htmlFor={`educationEndDate-${education.educationId}`}>End Date of
                                                Education</label>
                                            <input type="date" className="form-control"
                                                   id={`educationEndDate-${education.educationId}`}
                                                   value={education.educationEndDate} onChange={handleChange}
                                                   placeholder="End Date of Education"/>
                                        </div>
                                    </div>
                                </div>

                            )
                        })}

                        <div className="d-flex mt-4">
                            <h3>Experiences</h3>
                            <button type="button" className="btn btn-info mx-4" onClick={() => {
                                setFormData({
                                    ...formData, experiences: [
                                        ...formData.experiences,
                                        {
                                            experienceId: formData.experiences[formData.experiences.length - 1].experienceId + 1,
                                            experienceCompany: '',
                                            experienceDescription: '',
                                            experienceTitle: '',
                                            experienceStartDate: '',
                                            experienceEndDate: ''
                                        }
                                    ]
                                })
                            }}>add
                            </button>
                        </div>
                        {formData.experiences.map((experience) => {
                            return (
                                <div key={experience.experienceId}>
                                    <div className=" position-relative d-flex">
                                        <div className="horizontal-break"></div>
                                        <button className="btn btn-outline-danger" onClick={() => {
                                            let filter = formData.experiences.filter(item=>item.experienceId !== experience.experienceId);
                                            setFormData({...formData, experiences: filter})
                                        }}>❌</button>
                                    </div>
                                    <input type="hidden" id={`experienceId-${experience.experienceId}`}/>
                                    <div className="form-group">
                                        <label htmlFor={`experienceTitle-${experience.experienceId}`}>Job Title</label>
                                        <input type="text" className="form-control"
                                               id={`experienceTitle-${experience.experienceId}`}
                                               value={experience.experienceTitle}
                                               onChange={handleChange} placeholder="Job Title"/>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor={`experienceCompany-${experience.experienceId}`}>Company</label>
                                        <input type="text" className="form-control"
                                               id={`experienceCompany-${experience.experienceId}`}
                                               value={experience.experienceCompany}
                                               onChange={handleChange} placeholder="Company"/>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor={`experienceDescription-${experience.experienceId}`}>Job
                                            Description</label>
                                        <textarea className="form-control"
                                                  id={`experienceDescription-${experience.experienceId}`}
                                                  value={experience.experienceDescription}
                                                  onChange={handleChange} rows="3"
                                                  placeholder="Job Description"></textarea>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group col-md-6">
                                            <label htmlFor={`experienceStartDate-${experience.experienceId}`}>Start Date
                                                Job</label>
                                            <input type="date" className="form-control"
                                                   id={`experienceStartDate-${experience.experienceId}`}
                                                   value={experience.experienceStartDate}
                                                   onChange={handleChange}/>
                                        </div>
                                        <div className="form-group col-md-6">
                                            <label htmlFor={`experienceEndDate-${experience.experienceId}`}>End Date
                                                Job</label>
                                            <input type="date" className="form-control"
                                                   id={`experienceEndDate-${experience.experienceId}`}
                                                   value={experience.experienceEndDate.endDateJob}
                                                   onChange={handleChange}/>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        <button type="submit" className="btn btn-primary">Generate CV</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default App
