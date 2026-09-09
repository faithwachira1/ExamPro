import { useSettings } from '../../context/SettingsContext';

const Footer = () => {
  const { settings } = useSettings();

  return (
    <footer className="bg-white shadow-md mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-gray-500">
            {settings?.schoolName || 'ExamPro'} - {settings?.academicYear || new Date().getFullYear()} {settings?.term || ''}
          </p>
          <p className="text-sm text-gray-400 mt-2 md:mt-0">
            {settings?.reportFooter || `© ${new Date().getFullYear()} ExamPro by HDM`}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;