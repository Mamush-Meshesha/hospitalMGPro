import { Router } from 'express';
import addressRoutes from './routes/address.routes';
import authRoutes from './routes/auth.routes';
import analyticsRoutes from './routes/analytics.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/address', addressRoutes);

import tenantRoutes from './routes/tenant.routes';
router.use('/tenants', tenantRoutes);


import appointmentRoutes from './routes/appointment.routes';
router.use('/appointment', appointmentRoutes);

import bedRoutes from './routes/bed.routes';
router.use('/bed', bedRoutes);

import bedtypeRoutes from './routes/bedtype.routes';
router.use('/bedtype', bedtypeRoutes);

import billingRoutes from './routes/billing.routes';
router.use('/billing', billingRoutes);

import inventoryRoutes from './routes/inventory.routes';
router.use('/inventory', inventoryRoutes);

import queueRoutes from './routes/queue.routes';
router.use('/queue', queueRoutes);

import patientChartRoutes from './routes/patientChart.routes';
router.use('/patient-chart', patientChartRoutes);

import activeVisitsRoutes from './routes/activeVisits.routes';
router.use('/active-visits', activeVisitsRoutes);

import medicationsRoutes from './routes/medications.routes';
router.use('/medications', medicationsRoutes);

import patientProgramRoutes from './routes/patientProgram.routes';
router.use('/patient-program', patientProgramRoutes);

import reportsRoutes from './routes/reports.routes';
router.use('/reports', reportsRoutes);

import administrationlinksRoutes from './routes/administrationlinks.routes';
router.use('/administrationlinks', administrationlinksRoutes);

import alertRoutes from './routes/alert.routes';
router.use('/alert', alertRoutes);

import allergyRoutes from './routes/allergy.routes';
router.use('/allergy', allergyRoutes);

import answerRoutes from './routes/answer.routes';
router.use('/answer', answerRoutes);

import attributeRoutes from './routes/attribute.routes';
router.use('/attribute', attributeRoutes);

import caresettingRoutes from './routes/caresetting.routes';
router.use('/caresetting', caresettingRoutes);

import cohortRoutes from './routes/cohort.routes';
router.use('/cohort', cohortRoutes);

import conceptRoutes from './routes/concept.routes';
router.use('/concept', conceptRoutes);

import conceptattributetypeRoutes from './routes/conceptattributetype.routes';
router.use('/conceptattributetype', conceptattributetypeRoutes);

import conceptclassRoutes from './routes/conceptclass.routes';
router.use('/conceptclass', conceptclassRoutes);

import conceptdatatypeRoutes from './routes/conceptdatatype.routes';
router.use('/conceptdatatype', conceptdatatypeRoutes);

import conceptmaptypeRoutes from './routes/conceptmaptype.routes';
router.use('/conceptmaptype', conceptmaptypeRoutes);

import conceptproposalRoutes from './routes/conceptproposal.routes';
router.use('/conceptproposal', conceptproposalRoutes);

import conceptreferencerangeRoutes from './routes/conceptreferencerange.routes';
router.use('/conceptreferencerange', conceptreferencerangeRoutes);

import conceptreferencetermRoutes from './routes/conceptreferenceterm.routes';
router.use('/conceptreferenceterm', conceptreferencetermRoutes);

import conceptreferencetermmapRoutes from './routes/conceptreferencetermmap.routes';
router.use('/conceptreferencetermmap', conceptreferencetermmapRoutes);

import conceptsearchRoutes from './routes/conceptsearch.routes';
router.use('/conceptsearch', conceptsearchRoutes);

import conceptsourceRoutes from './routes/conceptsource.routes';
router.use('/conceptsource', conceptsourceRoutes);

import conceptstateconversionRoutes from './routes/conceptstateconversion.routes';
router.use('/conceptstateconversion', conceptstateconversionRoutes);

import conceptstopwordRoutes from './routes/conceptstopword.routes';
router.use('/conceptstopword', conceptstopwordRoutes);

import concepttreeRoutes from './routes/concepttree.routes';
router.use('/concepttree', concepttreeRoutes);

import conditionRoutes from './routes/condition.routes';
router.use('/condition', conditionRoutes);

import customdatatypeRoutes from './routes/customdatatype.routes';
router.use('/customdatatype', customdatatypeRoutes);

import databasechangeRoutes from './routes/databasechange.routes';
router.use('/databasechange', databasechangeRoutes);

import descriptionRoutes from './routes/description.routes';
router.use('/description', descriptionRoutes);

import drugRoutes from './routes/drug.routes';
router.use('/drug', drugRoutes);

import drugreferencemapRoutes from './routes/drugreferencemap.routes';
router.use('/drugreferencemap', drugreferencemapRoutes);

import encounterRoutes from './routes/encounter.routes';
router.use('/encounter', encounterRoutes);

import encounterroleRoutes from './routes/encounterrole.routes';
router.use('/encounterrole', encounterroleRoutes);

import encountertypeRoutes from './routes/encountertype.routes';
router.use('/encountertype', encountertypeRoutes);

import fieldRoutes from './routes/field.routes';
router.use('/field', fieldRoutes);

import fieldtypeRoutes from './routes/fieldtype.routes';
router.use('/fieldtype', fieldtypeRoutes);

import formRoutes from './routes/form.routes';
router.use('/form', formRoutes);

import formfieldRoutes from './routes/formfield.routes';
router.use('/formfield', formfieldRoutes);

import fulfillerdetailsRoutes from './routes/fulfillerdetails.routes';
router.use('/fulfillerdetails', fulfillerdetailsRoutes);

import genericChildRoutes from './routes/genericChild.routes';
router.use('/genericChild', genericChildRoutes);

import handlersRoutes from './routes/handlers.routes';
router.use('/handlers', handlersRoutes);

import hl7Routes from './routes/hl7.routes';
router.use('/hl7', hl7Routes);

import hl7sourceRoutes from './routes/hl7source.routes';
router.use('/hl7source', hl7sourceRoutes);

import identifierRoutes from './routes/identifier.routes';
router.use('/identifier', identifierRoutes);

import ingredientRoutes from './routes/ingredient.routes';
router.use('/ingredient', ingredientRoutes);

import locationRoutes from './routes/location.routes';
router.use('/location', locationRoutes);

import locationattributetypeRoutes from './routes/locationattributetype.routes';
router.use('/locationattributetype', locationattributetypeRoutes);

import locationtagRoutes from './routes/locationtag.routes';
router.use('/locationtag', locationtagRoutes);

import medicationdispenseRoutes from './routes/medicationdispense.routes';
router.use('/medicationdispense', medicationdispenseRoutes);

import membershipRoutes from './routes/membership.routes';
router.use('/membership', membershipRoutes);

import moduleRoutes from './routes/module.routes';
router.use('/module', moduleRoutes);

import moduleactionRoutes from './routes/moduleaction.routes';
router.use('/moduleaction', moduleactionRoutes);

import nameRoutes from './routes/name.routes';
router.use('/name', nameRoutes);

import nametemplateRoutes from './routes/nametemplate.routes';
router.use('/nametemplate', nametemplateRoutes);

import obsRoutes from './routes/obs.routes';
router.use('/obs', obsRoutes);

import obstreeRoutes from './routes/obstree.routes';
router.use('/obstree', obstreeRoutes);

import orderRoutes from './routes/order.routes';
router.use('/order', orderRoutes);

import orderableRoutes from './routes/orderable.routes';
router.use('/orderable', orderableRoutes);

import orderattributetypeRoutes from './routes/orderattributetype.routes';
router.use('/orderattributetype', orderattributetypeRoutes);

import orderentryconfigRoutes from './routes/orderentryconfig.routes';
router.use('/orderentryconfig', orderentryconfigRoutes);

import orderfrequencyRoutes from './routes/orderfrequency.routes';
router.use('/orderfrequency', orderfrequencyRoutes);

import ordergroupRoutes from './routes/ordergroup.routes';
router.use('/ordergroup', ordergroupRoutes);

import ordersetRoutes from './routes/orderset.routes';
router.use('/orderset', ordersetRoutes);

import ordersetmemberRoutes from './routes/ordersetmember.routes';
router.use('/ordersetmember', ordersetmemberRoutes);

import ordertypeRoutes from './routes/ordertype.routes';
router.use('/ordertype', ordertypeRoutes);

import patientRoutes from './routes/patient.routes';
router.use('/patient', patientRoutes);

import patientdiagnosesRoutes from './routes/patientdiagnoses.routes';
router.use('/patientdiagnoses', patientdiagnosesRoutes);

import patientidentifiertypeRoutes from './routes/patientidentifiertype.routes';
router.use('/patientidentifiertype', patientidentifiertypeRoutes);

import personRoutes from './routes/person.routes';
router.use('/person', personRoutes);

import personattributetypeRoutes from './routes/personattributetype.routes';
router.use('/personattributetype', personattributetypeRoutes);

import privilegeRoutes from './routes/privilege.routes';
router.use('/privilege', privilegeRoutes);

import programRoutes from './routes/program.routes';
router.use('/program', programRoutes);

import immunizationRoutes from './routes/immunization.routes';
router.use('/immunizations', immunizationRoutes);

import programattributetypeRoutes from './routes/programattributetype.routes';
router.use('/programattributetype', programattributetypeRoutes);

import diagnosisRoutes from './routes/diagnosis.routes';
router.use('/diagnosis', diagnosisRoutes);


import providerRoutes from './routes/provider.routes';
router.use('/provider', providerRoutes);

import providerattributetypeRoutes from './routes/providerattributetype.routes';
router.use('/providerattributetype', providerattributetypeRoutes);

import providerroleRoutes from './routes/providerrole.routes';
router.use('/providerrole', providerroleRoutes);

import recipientRoutes from './routes/recipient.routes';
router.use('/recipient', recipientRoutes);

import referencerangeRoutes from './routes/referencerange.routes';
router.use('/referencerange', referencerangeRoutes);



import relationshiptypeRoutes from './routes/relationshiptype.routes';
router.use('/relationshiptype', relationshiptypeRoutes);

import resourceRoutes from './routes/resource.routes';
router.use('/resource', resourceRoutes);

import roleRoutes from './routes/role.routes';
router.use('/role', roleRoutes);

import serverlogRoutes from './routes/serverlog.routes';
router.use('/serverlog', serverlogRoutes);

import stateRoutes from './routes/state.routes';
router.use('/state', stateRoutes);

import subdetailsRoutes from './routes/subdetails.routes';
router.use('/subdetails', subdetailsRoutes);

import systeminformationRoutes from './routes/systeminformation.routes';
router.use('/systeminformation', systeminformationRoutes);

import systemsettingRoutes from './routes/systemsetting.routes';
router.use('/systemsetting', systemsettingRoutes);

import taskactionRoutes from './routes/taskaction.routes';
router.use('/taskaction', taskactionRoutes);

import taskdefinitionRoutes from './routes/taskdefinition.routes';
router.use('/taskdefinition', taskdefinitionRoutes);

import unrelatedRoutes from './routes/unrelated.routes';
router.use('/unrelated', unrelatedRoutes);

import userRoutes from './routes/user.routes';
router.use('/user', userRoutes);

import visitRoutes from './routes/visit.routes';
router.use('/visit', visitRoutes);

import visitattributetypeRoutes from './routes/visitattributetype.routes';
router.use('/visitattributetype', visitattributetypeRoutes);

import visittypeRoutes from './routes/visittype.routes';
router.use('/visittype', visittypeRoutes);

import workflowRoutes from './routes/workflow.routes';
router.use('/workflow', workflowRoutes);

export default router;
