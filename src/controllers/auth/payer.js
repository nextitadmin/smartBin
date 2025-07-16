import Payer from '../../models/users/payer.js';
import { sendPayerIdEmail } from '../../utils/mailer.js';


 export async function createPayer(req, res) {
  try {
    const { firstName, lastName, email, dateOfBirth, nin } = req.body;
    const existingPayer = await Payer.findOne({ email });
    if (existingPayer) {
      return res.status(200).json({
        message: 'Payer already exists',
        payerId: existingPayer.payerId,
        data: existingPayer,
      });
    }
    const newPayer = await Payer.create({
      firstName,
      lastName,
      email,
      dateOfBirth,
      nin,
    });
    console.log({message: 'Payer created successfully. Payer ID has been sent to your mail'})
    await sendPayerIdEmail(newPayer.email, newPayer.firstName, newPayer.payerId);
    return res.status(201).json({
      message: 'Payer created successfully. Payer ID has been sent to your mail',
      payerId: newPayer.payerId, 
      data: newPayer,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Error creating payer',
      error: error.message,
    });
  }
}



export async function  getPayer(req, res) {
  try {
    const payer = await Payer.findOne({ payerId: req.params.payerId });

    if (!payer) {
      return res.status(404).json({ message: 'Payer not found' });
    }

    const { firstName, lastName, email } = payer;
    return res.status(200).json({ firstName, lastName, email });
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching payer info', error: err.message });
  }
};


