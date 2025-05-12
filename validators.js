const { body, param } = require('express-validator');

const authValidators = {
  signup: [
    body('email')
      .isEmail().withMessage('Veuillez fournir un email valide.')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères.'),
    body('fname')
      .notEmpty().withMessage('Le prénom est requis.')
      .isLength({ max: 100 }).withMessage('Le prénom ne peut pas dépasser 100 caractères.'),
    body('lname')
      .notEmpty().withMessage('Le nom est requis.')
      .isLength({ max: 100 }).withMessage('Le nom ne peut pas dépasser 100 caractères.'),
    body('phone')
      .optional()
      .isMobilePhone().withMessage('Le numéro de téléphone n\'est pas valide.')
  ],
  login: [
    body('email')
      .isEmail().withMessage('Veuillez fournir un email valide.')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Le mot de passe est requis.')
  ]
};

const reservationValidators = {
  create: [
    body('name')
      .notEmpty().withMessage('Le nom est requis.')
      .isLength({ max: 100 }).withMessage('Le nom ne peut pas dépasser 100 caractères.'),
    body('phone')
      .notEmpty().withMessage('Le numéro de téléphone est requis.')
      .isMobilePhone().withMessage('Le numéro de téléphone n\'est pas valide.'),
    body('number_of_people')
      .notEmpty().withMessage('Le nombre de personnes est requis.')
      .isInt({ min: 1 }).withMessage('Le nombre de personnes doit être un entier positif.'),
    body('date')
      .notEmpty().withMessage('La date est requise.')
      .isDate().withMessage('La date n\'est pas valide.')
      .custom(value => {
        const reservationDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (reservationDate < today) {
          throw new Error('La date de réservation ne peut pas être dans le passé.');
        }
        
        return true;
      }),
    body('time')
      .notEmpty().withMessage('L\'heure est requise.')
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('L\'heure doit être au format HH:MM.'),
    body('note')
      .optional()
      .isLength({ max: 1000 }).withMessage('La note ne peut pas dépasser 1000 caractères.')
  ],
  update: [
    param('id').isInt().withMessage('L\'ID de la réservation doit être un entier.'),
    body('name')
      .optional()
      .isLength({ max: 100 }).withMessage('Le nom ne peut pas dépasser 100 caractères.'),
    body('phone')
      .optional()
      .isMobilePhone().withMessage('Le numéro de téléphone n\'est pas valide.'),
    body('number_of_people')
      .optional()
      .isInt({ min: 1 }).withMessage('Le nombre de personnes doit être un entier positif.'),
    body('date')
      .optional()
      .isDate().withMessage('La date n\'est pas valide.')
      .custom(value => {
        const reservationDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (reservationDate < today) {
          throw new Error('La date de réservation ne peut pas être dans le passé.');
        }
        
        return true;
      }),
    body('time')
      .optional()
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('L\'heure doit être au format HH:MM.'),
    body('note')
      .optional()
      .isLength({ max: 1000 }).withMessage('La note ne peut pas dépasser 1000 caractères.')
  ]
};

const menuValidators = {
  create: [
    body('name')
      .notEmpty().withMessage('Le nom est requis.')
      .isLength({ max: 255 }).withMessage('Le nom ne peut pas dépasser 255 caractères.'),
    body('description')
      .optional()
      .isLength({ max: 1000 }).withMessage('La description ne peut pas dépasser 1000 caractères.'),
    body('price')
      .notEmpty().withMessage('Le prix est requis.')
      .isNumeric().withMessage('Le prix doit être un nombre.')
      .custom(value => {
        if (parseFloat(value) <= 0) {
          throw new Error('Le prix doit être positif.');
        }
        return true;
      }),
    body('category_id')
      .notEmpty().withMessage('La catégorie est requise.')
      .isInt().withMessage('L\'ID de la catégorie doit être un entier.'),
    body('image_url')
      .optional()
      .isURL().withMessage('L\'URL de l\'image n\'est pas valide.')
  ],
  update: [
    param('id').isInt().withMessage('L\'ID de l\'élément du menu doit être un entier.'),
    body('name')
      .optional()
      .isLength({ max: 255 }).withMessage('Le nom ne peut pas dépasser 255 caractères.'),
    body('description')
      .optional()
      .isLength({ max: 1000 }).withMessage('La description ne peut pas dépasser 1000 caractères.'),
    body('price')
      .optional()
      .isNumeric().withMessage('Le prix doit être un nombre.')
      .custom(value => {
        if (parseFloat(value) <= 0) {
          throw new Error('Le prix doit être positif.');
        }
        return true;
      }),
    body('category_id')
      .optional()
      .isInt().withMessage('L\'ID de la catégorie doit être un entier.'),
    body('image_url')
      .optional()
      .isURL().withMessage('L\'URL de l\'image n\'est pas valide.')
  ]
};

const tableValidators = {
  create: [
    body('seats')
      .notEmpty().withMessage('Le nombre de places est requis.')
      .isInt({ min: 2, max: 6 }).withMessage('Le nombre de places doit être entre 2 et 6.')
      .custom(value => {
        if (![2, 4, 6].includes(parseInt(value))) {
          throw new Error('Le nombre de places doit être 2, 4 ou 6.');
        }
        return true;
      }),
    body('name')
      .notEmpty().withMessage('Le nom est requis.')
      .isLength({ max: 50 }).withMessage('Le nom ne peut pas dépasser 50 caractères.')
  ],
  update: [
    param('id').isInt().withMessage('L\'ID de la table doit être un entier.'),
    body('seats')
      .optional()
      .isInt({ min: 2, max: 6 }).withMessage('Le nombre de places doit être entre 2 et 6.')
      .custom(value => {
        if (![2, 4, 6].includes(parseInt(value))) {
          throw new Error('Le nombre de places doit être 2, 4 ou 6.');
        }
        return true;
      }),
    body('name')
      .optional()
      .isLength({ max: 50 }).withMessage('Le nom ne peut pas dépasser 50 caractères.')
  ]
};

module.exports = {
  authValidators,
  reservationValidators,
  menuValidators,
  tableValidators
};