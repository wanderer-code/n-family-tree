// js/i18n.js

// Internationalization (i18n) and Localization (L10n) for Persian (fa)
export const fa = {
  // Main Page & Modals
  uploadChanges: "آپلود تغییرات",
  enterToken: "توکن (کد ورودی) را وارد نمایید.",
  token: "توکن",
  cancel: "لغو",
  save: "ذخیره",
  saving: "در حال ذخیره...",

  // GitHub Service Alerts & Messages
  changesFailed: "ثبت تغییرات با شکست مواجه شد. مجددا داده‌ها ارسال می‌گردند.",
  pleaseWait: "یک آپلود دیگر در حال انجام است. لطفا کمی منتظر بمانید.",
  uploadStatusUnknown:
    "وضعیت آپلود مشخص نیست. لطفا صفحه را رفرش کنید و دوباره امتحان کنید.",
  dataSavedSuccess: "داده‌ها با موفقیت ذخیره شد. تا ارسال بعدی کمی صبر کنید.",
  invalidToken: "احتمالا توکن ورودی شما نادرست است.",
  genericError: "مشکلی پیش آمده.",
  noChangesMade: "لطفا ابتدا تغییری در اطلاعات انجام دهید.",

  // Confirmation Modal
  deleteConfirmMessage: "آیا از حذف این فرد مطمئن هستید؟",
  removeRelationConfirmMessage: "آیا از حذف رابطه برای این فرد مطمئن هستید؟",
  confirm: "تایید",

  // Search Component
  searchPlaceholder: "جستجوی فرد...",

  // --- NEW: Generic Relationship Linking ---
  linkExistingPerson: "انتخاب از افراد موجود",
  linkExistingParent: "اتصال والد موجود",
  linkExistingChild: "اتصال فرزند موجود",
  selectSpouse: "انتخاب همسر",
  selectParent: "انتخاب والد",
  selectChild: "انتخاب فرزند",
  search: "جستجو...",
  personNotFound: "فردی یافت نشد.",
  relationSuccess: (name, relation) =>
    `ارتباط "${relation}" با "${name}" برقرار شد.`,
  personHasParent: (gender) =>
    `این شخص از قبل ${gender === "M" ? "پدر" : "مادر"} دارد.`,
  spouse: "همسر",
  father: "پدر",
  mother: "مادر",
  son: "پسر",
  daughter: "دختر",

  // Form Customizations
  addSpouse: "افزودن همسر",
  addParent: "افزودن والدین",
  addFather: "افزودن پدر",
  addMother: "افزودن مادر",
  addChild: "افزودن فرزند",
  addSon: "افزودن پسر",
  addDaughter: "افزودن دختر",

  male: "آقا",
  female: "خانم",
  firstName: "نام",
  lastName: "نام خانوادگی",
  birthday: "تولد",
  birthYear: "سال تولد",
  deathDate: "فوت",
  deathYear: "سال فوت",
  avatar: "پروفایل",
  avatarPlaceholder: "لینک آنلاین عکس پروفایل",
  submit: "ثبت",
  delete: "حذف",
  removeRelation: "حذف رابطه",
};
